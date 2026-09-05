import { useEffect, useRef, useState } from "react";
import { AimOutlined, AppstoreOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import Feature from "ol/Feature";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import View from "ol/View";
import { defaults as defaultControls, ScaleLine } from "ol/control";
import { isEmpty } from "ol/extent";
import Polygon from "ol/geom/Polygon";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { fromLonLat } from "ol/proj";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { Fill, Stroke, Style, Text } from "ol/style";
import "ol/ol.css";
import type { AuditRecord } from "@/api/interface/audit";

/** 审核地图展示与联动所需属性。 */
interface AuditMapProps {
	records: AuditRecord[];
	selectedIds: string[];
	focusedId?: string;
	onLandClick: (id: string) => void;
}

/** 地约后台默认地图中心点。 */
const DEFAULT_CENTER = fromLonLat([115.025, 38.504]);

/** 地图底图类型。 */
type BaseLayerType = "standard" | "satellite";

/** 将后端 EPSG:4326 点列转换为闭合的地图面坐标。 */
const getPolygonCoordinates = (record: AuditRecord): number[][] | undefined => {
	const points = [...record.gpsList].sort((left, right) => (left.sort ?? 0) - (right.sort ?? 0));
	if (
		points.length < 3 ||
		points.some(
			point =>
				!Number.isFinite(point.lng) || !Number.isFinite(point.lat) || Math.abs(point.lng) > 180 || Math.abs(point.lat) >= 90
		)
	)
		return undefined;
	const coordinates = points.map(point => fromLonLat([point.lng, point.lat]));
	const firstPoint = coordinates[0];
	const lastPoint = coordinates[coordinates.length - 1];
	if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) coordinates.push([...firstPoint]);
	return coordinates;
};

/** 按审核状态与选择状态创建地块样式。 */
const createAuditStyle = (record: AuditRecord, selected: boolean): Style => {
	const statusColor = record.status === "0" ? "#fa8c16" : record.status === "1" ? "#f5f5f5" : "#8c8c8c";
	const fillColor =
		record.status === "0" ? "rgba(250,140,22,.28)" : record.status === "1" ? "rgba(255,255,255,.3)" : "rgba(89,89,89,.28)";
	return new Style({
		stroke: new Stroke({ color: selected ? "#fadb14" : statusColor, width: selected ? 4 : 2 }),
		fill: new Fill({ color: selected ? "rgba(250,219,20,.3)" : fillColor }),
		text: new Text({
			text: `${record.landName} ${record.actualAcreNum.toFixed(2)}亩`,
			font: "13px sans-serif",
			fill: new Fill({ color: selected ? "#ad6800" : "#262626" }),
			stroke: new Stroke({ color: "rgba(255,255,255,.95)", width: 3 })
		})
	});
};

/** 展示待审核、已审核与已退地边界的 OpenLayers 地图。 */
const AuditMap = ({ records, selectedIds, focusedId, onLandClick }: AuditMapProps) => {
	// 保存地图容器与生命周期内唯一的 OpenLayers 实例。
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<OlMap | null>(null);
	const sourceRef = useRef(new VectorSource<Feature<Polygon>>());
	// 保存最新业务数据和事件回调，避免数据变化重建地图。
	const recordMapRef = useRef(new Map<string, AuditRecord>());
	const selectedSetRef = useRef(new Set<string>());
	const clickRef = useRef(onLandClick);
	const fittedSignatureRef = useRef("");
	clickRef.current = onLandClick;
	// 控制底图选择器和缩放显示。
	const [baseLayer, setBaseLayer] = useState<BaseLayerType>("satellite");
	const [layerPickerOpen, setLayerPickerOpen] = useState(false);
	const [zoom, setZoom] = useState(14);

	useEffect(
		/* 首次挂载时创建地图，离开页面时释放监听与图层。 */ () => {
			if (!containerRef.current) return;
			const standardLayer = new TileLayer({ source: new OSM({ crossOrigin: "anonymous" }), visible: false });
			const satelliteLayer = new TileLayer({
				source: new XYZ({ url: import.meta.env.VITE_MAP_SATELLITE_URL, crossOrigin: "anonymous" }),
				visible: true
			});
			let satelliteUnavailable = false;
			/** 卫星瓦片失败时回退至标准底图。 */
			const fallbackToStandard = () => {
				if (satelliteUnavailable) return;
				satelliteUnavailable = true;
				satelliteLayer.setVisible(false);
				standardLayer.setVisible(true);
				setBaseLayer("standard");
				message.warning("卫星影像暂时不可用，已切换为标准地图");
			};
			satelliteLayer.getSource()?.on("tileloaderror", fallbackToStandard);
			const auditLayer = new VectorLayer({
				source: sourceRef.current,
				style: feature => {
					const id = String(feature.getId() ?? "");
					const record = recordMapRef.current.get(id);
					return record ? createAuditStyle(record, selectedSetRef.current.has(id)) : undefined;
				},
				zIndex: 20
			});
			const view = new View({ center: DEFAULT_CENTER, zoom: 14, minZoom: 3, maxZoom: 20 });
			const map = new OlMap({
				target: containerRef.current,
				layers: [standardLayer, satelliteLayer, auditLayer],
				view,
				controls: defaultControls({ zoom: false, rotate: false }).extend([new ScaleLine({ units: "metric" })])
			});
			mapRef.current = map;
			/** 把命中的地块 ID 交回 React 列表。 */
			const handleMapClick = (event: MapBrowserEvent<UIEvent>) => {
				map.forEachFeatureAtPixel(event.pixel, feature => {
					const id = String(feature.getId() ?? "");
					if (!recordMapRef.current.has(id)) return undefined;
					clickRef.current(id);
					return true;
				});
			};
			/** 同步地图缩放级别到控件。 */
			const handleZoomChange = () => setZoom(view.getZoom() ?? 14);
			map.on("singleclick", handleMapClick);
			view.on("change:resolution", handleZoomChange);
			const resizeObserver = new ResizeObserver(() => map.updateSize());
			resizeObserver.observe(containerRef.current);
			return /* 完整清理本组件拥有的地图资源。 */ () => {
				map.un("singleclick", handleMapClick);
				view.un("change:resolution", handleZoomChange);
				satelliteLayer.getSource()?.un("tileloaderror", fallbackToStandard);
				resizeObserver.disconnect();
				sourceRef.current.clear();
				map.setTarget(undefined);
				map.dispose();
				mapRef.current = null;
				fittedSignatureRef.current = "";
			};
		},
		[]
	);

	useEffect(
		/* 将当前筛选结果同步为共享矢量源中的地块要素。 */ () => {
			recordMapRef.current = new Map(records.map(record => [record.id, record]));
			const source = sourceRef.current;
			source.clear();
			records.forEach(record => {
				const coordinates = getPolygonCoordinates(record);
				if (!coordinates) return;
				const feature = new Feature(new Polygon([coordinates]));
				feature.setId(record.id);
				source.addFeature(feature);
			});
			const signature = records.map(record => record.id).join("|");
			if (mapRef.current && signature && signature !== fittedSignatureRef.current && source.getFeatures().length) {
				mapRef.current.getView().fit(source.getExtent(), { padding: [70, 70, 70, 70], maxZoom: 17, duration: 320 });
				fittedSignatureRef.current = signature;
			}
		},
		[records]
	);

	useEffect(
		/* 刷新选择样式并在列表点击时聚焦地块。 */ () => {
			selectedSetRef.current = new Set(selectedIds);
			sourceRef.current.changed();
			if (!focusedId || !mapRef.current) return;
			const feature = sourceRef.current.getFeatureById(focusedId);
			if (!(feature instanceof Feature)) return;
			const extent = feature?.getGeometry()?.getExtent();
			if (extent && !isEmpty(extent))
				mapRef.current.getView().fit(extent, { padding: [120, 120, 120, 120], maxZoom: 18, duration: 280 });
		},
		[focusedId, selectedIds]
	);

	useEffect(
		/* 根据 React 状态切换标准与卫星底图。 */ () => {
			const layers = mapRef.current?.getLayers().getArray();
			layers?.[0]?.setVisible(baseLayer === "standard");
			layers?.[1]?.setVisible(baseLayer === "satellite");
		},
		[baseLayer]
	);

	// 渲染地图画布、审核状态图例和地图控制区。
	return (
		<div className="audit-map-shell">
			{/* OpenLayers 挂载容器 */}
			<div ref={containerRef} className="audit-map-canvas" />
			{/* 审核状态图例 */}
			<div className="audit-map-legend">
				<span>
					<i className="is-pending" />
					待审核
				</span>
				<span>
					<i className="is-approved" />
					已审核
				</span>
				<span>
					<i className="is-returned" />
					已退地
				</span>
			</div>
			{/* 图层、定位和缩放控制 */}
			<div className="audit-map-controls">
				<div className="audit-map-layer-control">
					<Button
						icon={<AppstoreOutlined />}
						className={layerPickerOpen ? "is-active" : ""}
						onClick={() => setLayerPickerOpen(value => !value)}
						aria-label="切换底图"
					/>
					{layerPickerOpen && (
						<div className="audit-map-layer-picker">
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
				<div className="audit-map-zoom-stack">
					<Button
						icon={<PlusOutlined />}
						onClick={() => mapRef.current?.getView().setZoom(Math.min(20, zoom + 1))}
						aria-label="放大"
					/>
					<span>{zoom.toFixed(0)}</span>
					<Button
						icon={<MinusOutlined />}
						onClick={() => mapRef.current?.getView().setZoom(Math.max(3, zoom - 1))}
						aria-label="缩小"
					/>
				</div>
			</div>
		</div>
	);
};

export default AuditMap;
