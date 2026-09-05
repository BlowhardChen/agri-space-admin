/** Turf 6 的 exports 未暴露声明文件；为本页实际使用的公开 API 补齐类型。 */
declare module "@turf/turf" {
	import type { Feature, FeatureCollection, Point, Polygon, Position } from "geojson";
	/** 按源算法计算所有输入点的凸包，无有效面时返回 null。 */
	export function convex(points: FeatureCollection<Point>): Feature<Polygon> | null;
	/** 将经纬度封装为 GeoJSON Point。 */
	export function point(coordinates: Position): Feature<Point>;
	/** 合并点要素为 GeoJSON FeatureCollection。 */
	export function featureCollection(features: Feature<Point>[]): FeatureCollection<Point>;
}
