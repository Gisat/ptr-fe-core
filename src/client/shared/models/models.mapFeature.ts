import type { Geometry, GeometryCollection, GeoJsonProperties, Feature as GeoJSONFeature } from 'geojson';

/**
 * Application-wide Feature type for mapping layers (GeoJsonLayer, IconLayer, etc.).
 *
 * - Fully compatible with the standard GeoJSON Feature, except it excludes GeometryCollection
 *   (which is rarely used in UI and not supported by most helpers).
 * - The geometry is always a single geometry type (Point, LineString, Polygon, etc.), never a collection.
 * - Optionally extended with a flat [lng, lat] `coordinates` property for convenience in point-based layers.
 *
 * @example
 * // Standard GeoJSON Feature
 * const feature: MapFeature = {
 *   type: 'Feature',
 *   geometry: { type: 'Point', coordinates: [14.42, 50.08] },
 *   properties: { name: 'Prague' }
 * };
 *
 * // With helper coordinates (for IconLayer, etc.)
 * const iconFeature: MapFeature = {
 *   type: 'Feature',
 *   geometry: { type: 'Point', coordinates: [14.42, 50.08] },
 *   properties: { name: 'Prague' },
 *   coordinates: [14.42, 50.08]
 * };
 */
export type MapFeature = GeoJSONFeature<Exclude<Geometry, GeometryCollection>, GeoJsonProperties> & {
	/**
	 * Optional flat [lng, lat] coordinates for non-GeoJSON / simplified cases.
	 * For true GeoJSON, prefer `geometry.coordinates`.
	 * Used mainly for point-based layers like IconLayer.
	 */
	coordinates?: [number, number];
};
