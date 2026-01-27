import type { Geometry, GeometryCollection, GeoJsonProperties, Feature as GeoJSONFeature } from 'geojson';

/**
 * Application-wide Feature type.
 * - Fully compatible with standard GeoJSON Feature.
 * - Optionally extended with a flat [lng, lat] helper coordinate.
 */
export type Feature = GeoJSONFeature<Exclude<Geometry, GeometryCollection>, GeoJsonProperties> & {
	/**
	 * Optional flat [lng, lat] coordinates for non-GeoJSON / simplified cases.
	 * For true GeoJSON, prefer `geometry.coordinates`.
	 */
	coordinates?: [number, number];
};
