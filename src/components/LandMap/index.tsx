import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AimOutlined, AppstoreOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import View from "ol/View";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { isEmpty } from "ol/extent";
import { Fill, Stroke, Style, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import type { LandRecord } from "@/api/interface/land";
import "./index.less";

/** 土地合并预览使用的地理坐标数据。 */
export interface MergePreview {
	ids: string[];
	area: number;
	coordinates: number[][];
}

/** 父页面可调用的地图能力。 */
export interface LandMapHandle {
	captureSnapshot: () => Promise<File | undefined>;
}

/** 土地地图的业务属性。 */
interface LandMapProps {
	records: LandRecord[];
	selectedIds: string[];
	focusedId?: string;
	childPreview?: LandRecord;
	mergePreview?: MergePreview;
	onLandClick: (id: string) => void;
}

/** 地图显示的默认深圳中心点。 */
const DEFAULT_CENTER = fromLonLat([114.085871, 22.546029]);

/** 定义地图底图类型，避免展示文案参与地图图层判断。 */
type BaseLayerType = "standard" | "satellite";

/** 将后端点列转换为闭合的 OpenLayers 面坐标。 */
const getPolygonCoordinates = (record: LandRecord): number[][] | undefined => {
	// 按后端 sort 字段稳定恢复边界顶点顺序。
	const points = [...(record.gpsList ?? [])].sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0));
	if (
		points.length < 3 ||
		points.some(
			point =>
				!Number.isFinite(Number(point.lng)) ||
				!Number.isFinite(Number(point.lat)) ||
				Math.abs(Number(point.lng)) > 180 ||
				Math.abs(Number(point.lat)) >= 90
		)
	)
		return undefined;
	// 转换到地图视图采用的 EPSG:3857。
	const coordinates = points.map(point => fromLonLat([Number(point.lng), Number(point.lat)]));
	// OpenLayers 面环要求首尾闭合。
	const firstPoint = coordinates[0];
	const lastPoint = coordinates[coordinates.length - 1];
	if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) coordinates.push([...firstPoint]);
	return coordinates;
};

/** 根据业务类型和选中状态创建地块样式。 */
const createLandStyle = (record: LandRecord, selected: boolean): Style => {
	// 流转与托管沿用源页面的绿色和青色视觉语义。
	const strokeColor = selected ? "#fadb14" : record.landType === "1" ? "#00d670" : "#13c2c2";
	// 选中面使用更醒目的黄色半透明填充。
	const fillColor = selected
		? "rgba(250, 219, 20, 0.24)"
		: record.landType === "1"
		? "rgba(0, 214, 112, 0.22)"
		: "rgba(19, 194, 194, 0.20)";
	return new Style({
		stroke: new Stroke({ color: strokeColor, width: selected ? 3 : 2 }),
		fill: new Fill({ color: fillColor }),
		text: new Text({
			text: `${record.landName || "未命名地块"} ${Number(record.actualAcreNum || 0).toFixed(2)}亩`,
			font: "14px sans-serif",
			fill: new Fill({ color: selected ? "#ad6800" : "#1f1f1f" }),
			stroke: new Stroke({ color: "rgba(255,255,255,.92)", width: 3 }),
			offsetY: -2
		})
	});
};

/** 将地图视口内的 canvas 合成为后端所需的地块快照。 */
const captureMapCanvas = (map: OlMap): Promise<File | undefined> =>
	new Promise(resolve => {
		// 瓦片失败或持续加载时有界退出，避免保存按钮永久等待。
		let settled = false;
		/** 统一完成截图并清理渲染监听和超时。 */
		const finish = (file?: File) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timeout);
			map.un("rendercomplete", handleRenderComplete);
			resolve(file);
		};
		// 提供足够的瓦片加载时间，同时保证失败可重试。
		const timeout = window.setTimeout(() => finish(), 15000);
		/** 在地图完成渲染后读取所有可见画布。 */
		const handleRenderComplete = () => {
			// 按当前地图像素尺寸创建最终快照画布。
			const size = map.getSize();
			if (!size || !map.getTarget()) return finish();
			// 合并底图和矢量图层，避免只截取其中一个 canvas。
			const output = document.createElement("canvas");
			output.width = size[0];
			output.height = size[1];
			// 读取合成画布的 2D 上下文。
			const context = output.getContext("2d");
			if (!context) return finish();

			try {
				// 将 OpenLayers 创建的各层画布按 DOM 顺序绘制到结果中。
				map
					.getViewport()
					.querySelectorAll<HTMLCanvasElement>(".ol-layer canvas, canvas.ol-layer")
					.forEach(canvas => {
						if (!canvas.width || !canvas.height) return;
						// OpenLayers 画布包含像素比及视图变换，按 CSS matrix 合成以保持对齐。
						const opacity = canvas.parentElement?.style.opacity || canvas.style.opacity;
						const matrix = canvas.style.transform
							.match(/^matrix\(([^)]+)\)$/)?.[1]
							.split(",")
							.map(Number);
						context.save();
						context.globalAlpha = opacity ? Number(opacity) : 1;
						if (matrix?.length === 6) context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
						else
							context.scale(
								Number.parseFloat(canvas.style.width || String(output.width)) / canvas.width,
								Number.parseFloat(canvas.style.height || String(output.height)) / canvas.height
							);
						context.drawImage(canvas, 0, 0);
						context.restore();
					});
				output.toBlob(blob => finish(blob ? new File([blob], "merge-land.png", { type: "image/png" }) : undefined), "image/png");
			} catch {
				// 跨域截图失败时阻止提交不完整的合并记录。
				finish();
			}
		};

		map.once("rendercomplete", handleRenderComplete);
		map.renderSync();
	});

/** 展示土地边界、选择状态和合并预览的 OpenLayers 地图。 */
const LandMap = forwardRef<LandMapHandle, LandMapProps>(
	({ records, selectedIds, focusedId, childPreview, mergePreview, onLandClick }, ref) => {
		// 保存地图容器 DOM。
		const containerRef = useRef<HTMLDivElement | null>(null);
		// 保存生命周期内唯一的地图实例。
		const mapRef = useRef<OlMap | null>(null);
		// 保存全部业务地块使用的共享矢量源。
		const landSourceRef = useRef(new VectorSource<Feature<Polygon>>());
		// 保存子地块和合并轮廓等临时预览源。
		const previewSourceRef = useRef(new VectorSource<Feature<Polygon>>());
		// 保存按 ID 查询的最新业务数据，供地图点击事件使用。
		const recordMapRef = useRef(new Map<string, LandRecord>());
		// 保存最新的选中集合，供样式函数读取。
		const selectedSetRef = useRef(new Set<string>());
		// 保存地图最近一次自动适配的数据签名。
		const fittedSignatureRef = useRef("");
		// 保存最新点击回调，避免父组件回调变化触发地图重建。
		const clickRef = useRef(onLandClick);
		clickRef.current = onLandClick;
		// 控制标准地图与卫星影像图层切换。
		const [baseLayer, setBaseLayer] = useState<BaseLayerType>("satellite");
		// 控制右侧图层选择浮层的展开状态。
		const [layerPickerOpen, setLayerPickerOpen] = useState(false);
		// 展示当前缩放级别。
		const [zoom, setZoom] = useState(14);

		useImperativeHandle(
			ref,
			/* 向父页面提供地图快照能力。 */ () => ({
				/** 捕获当前地图视口。 */
				captureSnapshot: () => (mapRef.current ? captureMapCanvas(mapRef.current) : Promise.resolve(undefined))
			}),
			[]
		);

		useEffect(
			/* 构造一次地图并在页面离开时完整清理。 */ () => {
				if (!containerRef.current) return;
				// 创建无需密钥的标准底图。
				const standardLayer = new TileLayer({ source: new OSM({ crossOrigin: "anonymous" }), visible: false });
				// 创建支持跨域读取的卫星瓦片底图，保证画布可绘制且能用于截图。
				const satelliteLayer = new TileLayer({
					source: new XYZ({
						url: import.meta.env.VITE_MAP_SATELLITE_URL,
						crossOrigin: "anonymous"
					}),
					visible: true
				});
				// 标记卫星服务是否已发生首个加载错误，避免重复切换底图和重复提示。
				let satelliteUnavailable = false;
				/** 卫星瓦片不可用时自动回退到标准底图，确保地图区域不会空白。 */
				const fallbackToStandardLayer = () => {
					if (satelliteUnavailable) return;
					satelliteUnavailable = true;
					satelliteLayer.setVisible(false);
					standardLayer.setVisible(true);
					setBaseLayer("standard");
					message.warning("卫星影像暂时不可用，已切换为标准地图");
				};
				satelliteLayer.getSource()?.on("tileloaderror", fallbackToStandardLayer);
				// 创建共享地块图层并通过公开属性读取业务 ID。
				const landLayer = new VectorLayer({
					source: landSourceRef.current,
					style: feature => {
						// 使用 Feature ID 查回可序列化的地块数据。
						const id = String(feature.getId() ?? "");
						const record = recordMapRef.current.get(id);
						return record ? createLandStyle(record, selectedSetRef.current.has(id)) : undefined;
					},
					zIndex: 20
				});
				// 创建黄色虚线的临时预览图层。
				const previewLayer = new VectorLayer({
					source: previewSourceRef.current,
					style: new Style({
						stroke: new Stroke({ color: "#fadb14", width: 3, lineDash: [8, 6] }),
						fill: new Fill({ color: "rgba(250, 219, 20, .14)" })
					}),
					zIndex: 30
				});
				// 建立 EPSG:3857 视图，API 边界仍保持经纬度。
				const view = new View({ center: DEFAULT_CENTER, zoom: 14, minZoom: 3, maxZoom: 20 });
				// 构造 OpenLayers 地图。
				const map = new OlMap({
					target: containerRef.current,
					layers: [standardLayer, satelliteLayer, landLayer, previewLayer],
					view,
					controls: defaultControls({ zoom: false, rotate: false }).extend([new ScaleLine({ units: "metric" })])
				});
				mapRef.current = map;

				/** 将地图点击命中的地块 ID 交回 React 页面。 */
				const handleMapClick = (event: MapBrowserEvent<UIEvent>) => {
					map.forEachFeatureAtPixel(event.pixel, feature => {
						// 临时预览要素没有业务 ID，不参与列表选择。
						const id = feature.getId();
						if (id !== undefined && recordMapRef.current.has(String(id))) {
							clickRef.current(String(id));
							return true;
						}
						return undefined;
					});
				};
				/** 同步地图缩放级别到右侧控件。 */
				const handleResolutionChange = () => setZoom(view.getZoom() ?? 14);
				map.on("singleclick", handleMapClick);
				view.on("change:resolution", handleResolutionChange);
				// 收起左侧列表和布局变化时同步地图画布尺寸。
				const resizeObserver = new ResizeObserver(() => map.updateSize());
				resizeObserver.observe(containerRef.current);

				return /* 卸载时移除监听和地图目标，避免重复进入页面产生泄漏。 */ () => {
					map.un("singleclick", handleMapClick);
					view.un("change:resolution", handleResolutionChange);
					satelliteLayer.getSource()?.un("tileloaderror", fallbackToStandardLayer);
					resizeObserver.disconnect();
					landSourceRef.current.clear();
					previewSourceRef.current.clear();
					map.setTarget(undefined);
					map.dispose();
					fittedSignatureRef.current = "";
					mapRef.current = null;
				};
			},
			[]
		);

		useEffect(
			/* 将最新土地业务数据同步到共享矢量源。 */ () => {
				// 更新地图点击和样式查找所需的数据映射。
				recordMapRef.current = new Map(records.map(record => [record.id, record]));
				// 重建当前结果集的矢量要素，不持久化 OpenLayers 对象。
				const source = landSourceRef.current;
				source.clear();
				records.forEach(record => {
					// 跳过缺少有效边界的记录，列表功能保持可用。
					const coordinates = getPolygonCoordinates(record);
					if (!coordinates) return;
					// 仅把业务 ID 放入 Feature，完整数据继续留在 React 状态。
					const feature = new Feature(new Polygon([coordinates]));
					feature.setId(record.id);
					source.addFeature(feature);
				});

				// 仅在结果集改变时自动适配全部有效地块。
				const signature = records.map(record => record.id).join("|");
				const map = mapRef.current;
				if (map && signature && signature !== fittedSignatureRef.current && source.getFeatures().length) {
					map.getView().fit(source.getExtent(), { padding: [64, 64, 64, 64], maxZoom: 17, duration: 350 });
					fittedSignatureRef.current = signature;
				}
			},
			[records]
		);

		useEffect(
			/* 刷新选中地块样式并聚焦列表当前项。 */ () => {
				selectedSetRef.current = new Set(selectedIds);
				landSourceRef.current.changed();
				if (!focusedId || !mapRef.current) return;
				// 聚焦前确认 ID 对应要素和范围都有效。
				const feature = landSourceRef.current.getFeatureById(focusedId);
				if (!(feature instanceof Feature)) return;
				const extent = feature?.getGeometry()?.getExtent();
				if (extent && !isEmpty(extent))
					mapRef.current.getView().fit(extent, { padding: [120, 120, 120, 120], maxZoom: 18, duration: 280 });
			},
			[focusedId, selectedIds]
		);

		useEffect(
			/* 绘制合并轮廓或合并地块下的单块预览。 */ () => {
				const source = previewSourceRef.current;
				source.clear();
				// 优先显示待提交的合并轮廓。
				const geographicCoordinates = mergePreview?.coordinates ?? childPreview?.gpsList?.map(point => [point.lng, point.lat]);
				if (!geographicCoordinates || geographicCoordinates.length < 3) return;
				// 将预览坐标闭合后转换到视图投影。
				const coordinates = geographicCoordinates.map(point => fromLonLat([Number(point[0]), Number(point[1])]));
				const firstPoint = coordinates[0];
				const lastPoint = coordinates[coordinates.length - 1];
				if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) coordinates.push([...firstPoint]);
				// 创建不带业务 ID 的预览要素。
				const feature = new Feature(new Polygon([coordinates]));
				source.addFeature(feature);
				const map = mapRef.current;
				if (map)
					map.getView().fit(feature.getGeometry()!.getExtent(), { padding: [100, 100, 100, 100], maxZoom: 18, duration: 280 });
			},
			[childPreview, mergePreview]
		);

		useEffect(
			/* 同步底图切换状态到 OpenLayers 图层。 */ () => {
				const layers = mapRef.current?.getLayers().getArray();
				if (!layers) return;
				layers[0]?.setVisible(baseLayer === "standard");
				layers[1]?.setVisible(baseLayer === "satellite");
			},
			[baseLayer]
		);

		/** 使用浏览器定位能力将地图移动到当前位置。 */
		const locateUser = () => {
			if (!navigator.geolocation) return message.warning("当前浏览器不支持定位");
			navigator.geolocation.getCurrentPosition(
				position => {
					// 浏览器定位返回经纬度，进入地图前转换到 EPSG:3857。
					mapRef.current
						?.getView()
						.animate({ center: fromLonLat([position.coords.longitude, position.coords.latitude]), zoom: 16, duration: 350 });
				},
				() => message.warning("定位失败，请检查浏览器定位权限")
			);
		};

		/** 在现有缩放级别基础上调整地图比例。 */
		const changeZoom = (delta: number) => {
			const view = mapRef.current?.getView();
			if (view) view.animate({ zoom: (view.getZoom() ?? 14) + delta, duration: 180 });
		};

		// 渲染地图容器、底部图例和参考地约样式的右侧地图控件。
		return (
			<div className="land-map-shell">
				{/* OpenLayers 挂载区域 */}
				<div ref={containerRef} className="land-map-canvas" />
				{/* 地块类型图例 */}
				<div className="land-map-legend">
					<span>
						<i className="is-transfer" />
						流转
					</span>
					<span>
						<i className="is-managed" />
						托管
					</span>
				</div>
				{/* 右侧图层、定位和缩放工具栏 */}
				<div className="land-map-controls">
					{layerPickerOpen && (
						<div className="land-map-layer-picker">
							<button
								className={baseLayer === "standard" ? "is-active" : ""}
								onClick={() => {
									setBaseLayer("standard");
									setLayerPickerOpen(false);
								}}
							>
								<span className="land-map-layer-preview is-standard" />
								标准地图
							</button>
							<button
								className={baseLayer === "satellite" ? "is-active" : ""}
								onClick={() => {
									setBaseLayer("satellite");
									setLayerPickerOpen(false);
								}}
							>
								<span className="land-map-layer-preview is-satellite" />
								卫星地图
							</button>
						</div>
					)}
					<Button
						className={layerPickerOpen ? "is-active" : ""}
						icon={<AppstoreOutlined />}
						onClick={() => setLayerPickerOpen(open => !open)}
						title="切换地图图层"
					/>
					<Button icon={<AimOutlined />} onClick={locateUser} title="定位" />
					<div className="land-map-zoom-stack">
						<Button icon={<PlusOutlined />} onClick={() => changeZoom(1)} title="放大" />
						<span className="land-map-zoom">{zoom.toFixed(0)}</span>
						<Button icon={<MinusOutlined />} onClick={() => changeZoom(-1)} title="缩小" />
					</div>
				</div>
			</div>
		);
	}
);

LandMap.displayName = "LandMap";

export default LandMap;
