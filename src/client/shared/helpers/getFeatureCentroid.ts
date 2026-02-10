import center from '@turf/center';
import type { Feature as TurfFeature } from 'geojson';
import type { MapFeature } from '../models/models.mapFeature';

/**
 * Compute a representative centroid [lng, lat] for a GeoJSON Feature.
 *
 * - For Point geometries, returns the point coordinates directly.
 * - For Polygon, MultiPolygon, LineString, MultiLineString, MultiPoint,
 *   uses `@turf/center` (which supports all these).
 * - Returns `undefined` when geometry/coordinates are missing or invalid.
 *
 * @param feature Application-wide Feature (GeoJSON-compatible).
 * @returns A flat [lng, lat] tuple or undefined if not computable.
 */
export function getFeatureCentroid(feature: MapFeature): [number, number] | undefined {
	const geometry = feature.geometry;

	// Warn and return undefined if geometry is missing
	if (!geometry) {
		console.warn('getFeatureCentroid: feature has no geometry.', feature);
		return undefined;
	}

	// Destructure type and coordinates for easier access
	const { type, coordinates } = geometry;

	// Warn and return undefined if type or coordinates are missing
	if (!type || coordinates == null) {
		console.warn('getFeatureCentroid: geometry is missing type or coordinates.', geometry);
		return undefined;
	}

	// Fast path for Point – just return its coordinates if valid.
	if (type === 'Point') {
		if (
			Array.isArray(coordinates) &&
			coordinates.length >= 2 &&
			typeof coordinates[0] === 'number' &&
			typeof coordinates[1] === 'number'
		) {
			return [coordinates[0], coordinates[1]];
		}
		console.warn('getFeatureCentroid: invalid Point coordinates.', geometry);
		return undefined;
	}

	// For all other supported geometry types, use turf.center to compute centroid
	try {
		const turfFeature: TurfFeature = {
			type: 'Feature',
			geometry: geometry as TurfFeature['geometry'],
			properties: feature.properties || {},
		};

		const centerPoint = center(turfFeature);
		const centerCoords = centerPoint.geometry?.coordinates;

		// Validate that turf.center returned a flat coordinate array
		if (
			Array.isArray(centerCoords) &&
			centerCoords.length >= 2 &&
			typeof centerCoords[0] === 'number' &&
			typeof centerCoords[1] === 'number'
		) {
			return [centerCoords[0], centerCoords[1]];
		}

		console.warn('getFeatureCentroid: turf.center returned invalid coordinates.', centerPoint);
		return undefined;
	} catch (error) {
		console.warn('getFeatureCentroid: error while computing centroid via turf.center.', error, geometry);
		return undefined;
	}
}
