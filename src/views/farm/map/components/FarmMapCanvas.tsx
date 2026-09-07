import { useEffect, useRef, useState } from "react";
import { AimOutlined, AppstoreOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import Feature from "ol/Feature";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import View from "ol/View";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { isEmpty } from "ol/extent";
import LineString from "ol/geom/LineString";
import Polygon from "ol/geom/Polygon";
import DragBox from "ol/interaction/DragBox";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Fill, Stroke, Style, Text } from "ol/style";
import "ol/ol.css";
import type { FarmMapLand, FarmTrajectory } from "@/api/interface/farmMap";

/** 农事地图画布属性。 */
interface FarmMapCanvasProps {
	lands: FarmMapLand[];
	trajectories: FarmTrajectory[];
	selectedLandIds: string[];
	focusedLandId?: string;
	rectangleSelecting: boolean;
	onLandClick: (landId: string) => void;
	onRectangleSelect: (landIds: string[]) => void;
}

/** 地图底图类型。 */
type BaseLayerType = "standard" | "satellite";

/** 农事地图默认中心点。 */
const DEFAULT_CENTER = fromLonLat([115.025, 38.504]);

/** 将业务经纬度边界转换为闭合的 EPSG:3857 面坐标。 */
const getPolygonCoordinates = (land: FarmMapLand): number[][] | undefined => {
	// 按后端排序字段恢复稳定的顶点顺序。
	const points = [...land.gpsList].sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0));
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
	// 在 OpenLayers 边界将 EPSG:4326 转为 EPSG:3857。
	const coordinates = points.map(point => fromLonLat([Number(point.lng), Number(point.lat)]));
	// 保证多边形首尾闭合。
	const firstPoint = coordinates[0];
	const lastPoint = coordinates[coordinates.length - 1];
	if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) coordinates.push([...firstPoint]);
	return coordinates;
};

/** 按经营类型和选择状态创建农事地块样式。 */
const createLandStyle = (land: FarmMapLand, selected: boolean): Style => {
	// 流转地块使用绿色，托管地块使用青色，选中态使用主题黄色。
	const strokeColor = selected ? "#fadb14" : land.landType === "1" ? "#00b96b" : "#13c2c2";
	const fillColor = selected ? "rgba(250,219,20,.28)" : land.landType === "1" ? "rgba(0,185,107,.25)" : "rgba(19,194,194,.24)";
	return new Style({
		stroke: new Stroke({ color: strokeColor, width: selected ? 4 : 2 }),
		fill: new Fill({ color: fillColor }),
		text: new Text({
			text: `${land.landName} ${land.actualAcreNum.toFixed(2)}亩`,
			font: "13px sans-serif",
			fill: new Fill({ color: selected ? "#ad6800" : "#1f1f1f" }),
			stroke: new Stroke({ color: "rgba(255,255,255,.95)", width: 3 })
		})
	});
};

/** 展示农事地块、作业轨迹和框选交互的 OpenLayers 地图。 */
const FarmMapCanvas = ({
	lands,
	trajectories,
	selectedLandIds,
	focusedLandId,
	rectangleSelecting,
	onLandClick,
	onRectangleSelect
}: FarmMapCanvasProps) => {
	// 保存地图容器与生命周期内唯一的 OpenLayers 实例。
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<OlMap | null>(null);
	const landSourceRef = useRef(new VectorSource<Feature<Polygon>>());
	const trajectorySourceRef = useRef(new VectorSource<Feature<LineString>>());
	// 保存最新业务数据和回调，避免数据变化重建地图。
	const landMapRef = useRef(new Map<string, FarmMapLand>());
	const selectedSetRef = useRef(new Set<string>());
	const clickRef = useRef(onLandClick);
	const rectangleRef = useRef(onRectangleSelect);
	const fittedSignatureRef = useRef("");
	clickRef.current = onLandClick;
	rectangleRef.current = onRectangleSelect;
	// 控制底图选择器和缩放显示。
	const [baseLayer, setBaseLayer] = useState<BaseLayerType>("satellite");
	const [layerPickerOpen, setLayerPickerOpen] = useState(false);
	const [zoom, setZoom] = useState(14);

	useEffect(
		/* 首次挂载时创建地图，离开页面时释放全部资源。 */ () => {
			if (!containerRef.current) return;
			// 创建无需密钥的标准底图。
			const standardLayer = new TileLayer({ source: new OSM({ crossOrigin: "anonymous" }), visible: false });
			// 创建项目配置的卫星底图。
			const satelliteLayer = new TileLayer({
				source: new XYZ({ url: import.meta.env.VITE_MAP_SATELLITE_URL, crossOrigin: "anonymous" }),
				visible: true
			});
			// 确保瓦片失败只回退和提示一次。
			let satelliteUnavailable = false;
			/** 卫星瓦片不可用时自动回退到标准地图。 */
			const fallbackToStandard = () => {
				if (satelliteUnavailable) return;
				satelliteUnavailable = true;
				satelliteLayer.setVisible(false);
				standardLayer.setVisible(true);
				setBaseLayer("standard");
				message.warning("卫星影像暂时不可用，已切换为标准地图");
			};
			satelliteLayer.getSource()?.on("tileloaderror", fallbackToStandard);
			// 创建共享地块图层。
			const landLayer = new VectorLayer({
				source: landSourceRef.current,
				style: feature => {
					// 通过公开 Feature ID 读取业务数据。
					const id = String(feature.getId() ?? "");
					const land = landMapRef.current.get(id);
					return land ? createLandStyle(land, selectedSetRef.current.has(id)) : undefined;
				},
				zIndex: 20
			});
			// 创建计划和实际轨迹共享图层。
			const trajectoryLayer = new VectorLayer({
				source: trajectorySourceRef.current,
				style: feature => {
					// 计划线用蓝色虚线，实际线用橙色实线。
					const planned = feature.get("locusType") === "planned";
					return new Style({
						stroke: new Stroke({
							color: planned ? "#1677ff" : "#fa8c16",
							width: planned ? 3 : 4,
							lineDash: planned ? [8, 6] : undefined
						})
					});
				},
				zIndex: 30
			});
			// 使用 EPSG:3857 作为地图显示投影。
			const view = new View({ center: DEFAULT_CENTER, zoom: 14, minZoom: 3, maxZoom: 20 });
			const map = new OlMap({
				target: containerRef.current,
				layers: [standardLayer, satelliteLayer, landLayer, trajectoryLayer],
				view,
				controls: defaultControls({ zoom: false, rotate: false }).extend([new ScaleLine({ units: "metric" })])
			});
			mapRef.current = map;

			/** 将地图点击命中的地块 ID 返回页面。 */
			const handleMapClick = (event: MapBrowserEvent<UIEvent>) => {
				map.forEachFeatureAtPixel(event.pixel, feature => {
					// 轨迹要素没有地块业务 ID，不参与点击选择。
					const id = String(feature.getId() ?? "");
					if (!landMapRef.current.has(id)) return undefined;
					clickRef.current(id);
					return true;
				});
			};
			/** 同步地图缩放级别到控制条。 */
			const handleZoomChange = () => setZoom(view.getZoom() ?? 14);
			map.on("singleclick", handleMapClick);
			view.on("change:resolution", handleZoomChange);
			// 侧栏收起和抽屉变化时刷新地图尺寸。
			const resizeObserver = new ResizeObserver(() => map.updateSize());
			resizeObserver.observe(containerRef.current);

			return /* 完整清理本组件拥有的监听、图层和地图实例。 */ () => {
				map.un("singleclick", handleMapClick);
				view.un("change:resolution", handleZoomChange);
				satelliteLayer.getSource()?.un("tileloaderror", fallbackToStandard);
				resizeObserver.disconnect();
				landSourceRef.current.clear();
				trajectorySourceRef.current.clear();
				map.setTarget(undefined);
				map.dispose();
				mapRef.current = null;
				fittedSignatureRef.current = "";
			};
		},
		[]
	);

	useEffect(
		/* 将当前农事地块同步到共享矢量源。 */ () => {
			landMapRef.current = new Map(lands.map(land => [land.id, land]));
			const source = landSourceRef.current;
			source.clear();
			lands.forEach(land => {
				// 跳过坐标无效的地块，列表仍保持可用。
				const coordinates = getPolygonCoordinates(land);
				if (!coordinates) return;
				const feature = new Feature(new Polygon([coordinates]));
				feature.setId(land.id);
				source.addFeature(feature);
			});
			// 仅在地块集合变化时自动适配范围。
			const signature = lands.map(land => land.id).join("|");
			if (mapRef.current && signature && signature !== fittedSignatureRef.current && source.getFeatures().length) {
				mapRef.current.getView().fit(source.getExtent(), { padding: [70, 70, 70, 70], maxZoom: 17, duration: 320 });
				fittedSignatureRef.current = signature;
			}
		},
		[lands]
	);

	useEffect(
		/* 将有序 EPSG:4326 轨迹同步到独立线图层。 */ () => {
			const source = trajectorySourceRef.current;
			source.clear();
			trajectories.forEach(trajectory => {
				// 跳过不足两个有效点的轨迹。
				const coordinates = trajectory.locusGpsList
					.filter(point => Number.isFinite(point.lng) && Number.isFinite(point.lat))
					.map(point => fromLonLat([point.lng, point.lat]));
				if (coordinates.length < 2) return;
				const feature = new Feature(new LineString(coordinates));
				feature.set("locusType", trajectory.locusType);
				source.addFeature(feature);
			});
		},
		[trajectories]
	);

	useEffect(
		/* 刷新选择样式并聚焦列表当前地块。 */ () => {
			selectedSetRef.current = new Set(selectedLandIds);
			landSourceRef.current.changed();
			if (!focusedLandId || !mapRef.current) return;
			const feature = landSourceRef.current.getFeatureById(focusedLandId);
			if (!(feature instanceof Feature)) return;
			const extent = feature.getGeometry()?.getExtent();
			if (extent && !isEmpty(extent)) {
				mapRef.current.getView().fit(extent, { padding: [120, 120, 120, 120], maxZoom: 18, duration: 280 });
			}
		},
		[focusedLandId, selectedLandIds]
	);

	useEffect(
		/* 在矩形选择模式中挂载 DragBox，退出模式时立即移除。 */ () => {
			const map = mapRef.current;
			if (!map || !rectangleSelecting) return;
			const interaction = new DragBox();
			/** 返回与选择框相交的全部业务地块 ID。 */
			const handleBoxEnd = () => {
				const extent = interaction.getGeometry().getExtent();
				const ids = landSourceRef.current
					.getFeatures()
					.filter(feature => feature.getGeometry()?.intersectsExtent(extent))
					.map(feature => String(feature.getId()));
				rectangleRef.current(ids);
			};
			interaction.on("boxend", handleBoxEnd);
			map.addInteraction(interaction);
			map.getTargetElement().style.cursor = "crosshair";
			return () => {
				interaction.un("boxend", handleBoxEnd);
				map.removeInteraction(interaction);
				map.getTargetElement().style.cursor = "";
			};
		},
		[rectangleSelecting]
	);

	useEffect(
		/* 根据 React 状态切换标准与卫星底图。 */ () => {
			const layers = mapRef.current?.getLayers().getArray();
			layers?.[0]?.setVisible(baseLayer === "standard");
			layers?.[1]?.setVisible(baseLayer === "satellite");
		},
		[baseLayer]
	);

	/** 在当前地图缩放级别基础上调整一级。 */
	const changeZoom = (delta: number) => {
		const view = mapRef.current?.getView();
		if (view) view.animate({ zoom: Math.max(3, Math.min(20, (view.getZoom() ?? 14) + delta)), duration: 180 });
	};

	// 渲染地图、地块与轨迹图例以及地图控制区。
	return (
		<div className="farm-map-shell">
			{/* OpenLayers 挂载容器 */}
			<div ref={containerRef} className="farm-map-canvas" />
			{/* 地块和轨迹图例 */}
			<div className="farm-map-legend">
				<span>
					<i className="is-transfer" />
					流转地块
				</span>
				<span>
					<i className="is-managed" />
					托管地块
				</span>
				<span>
					<i className="is-actual-line" />
					实际轨迹
				</span>
				<span>
					<i className="is-planned-line" />
					计划轨迹
				</span>
			</div>
			{/* 图层、定位和缩放控制 */}
			<div className="farm-map-controls">
				<div className="farm-map-layer-control">
					<Button
						icon={<AppstoreOutlined />}
						className={layerPickerOpen ? "is-active" : ""}
						onClick={() => setLayerPickerOpen(value => !value)}
						aria-label="切换底图"
					/>
					{layerPickerOpen && (
						<div className="farm-map-layer-picker">
							<button className={baseLayer === "standard" ? "is-active" : ""} onClick={() => setBaseLayer("standard")}>
								<i className="is-standard" />
								标准地图
							</button>
							<button className={baseLayer === "satellite" ? "is-active" : ""} onClick={() => setBaseLayer("satellite")}>
								<i className="is-satellite" />
								卫星地图
							</button>
						</div>
					)}
				</div>
				<Button
					icon={<AimOutlined />}
					onClick={() => mapRef.current?.getView().animate({ center: DEFAULT_CENTER, zoom: 14, duration: 250 })}
					aria-label="返回默认位置"
				/>
				<div className="farm-map-zoom-stack">
					<Button icon={<PlusOutlined />} onClick={() => changeZoom(1)} aria-label="放大" />
					<span>{zoom.toFixed(0)}</span>
					<Button icon={<MinusOutlined />} onClick={() => changeZoom(-1)} aria-label="缩小" />
				</div>
			</div>
		</div>
	);
};

export default FarmMapCanvas;
