import center from '@turf/center';
import type { Feature as TurfFeature } from 'geojson';
import type { Feature } from '../models/models.feature';

/**
 * Returns the centroid [lng, lat] of a Feature.
 */
export function getFeatureCentroid(feature: Feature): [number, number] | undefined {
	const geometry = feature.geometry;
	if (!geometry || !geometry.type || !('coordinates' in geometry)) return undefined;

	if (geometry.type === 'Polygon') {
		const polygonFeature: TurfFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: geometry.coordinates,
			},
			properties: feature.properties || {},
		};
		const centerPoint = center(polygonFeature);
		return centerPoint.geometry.coordinates as [number, number];
	} else if (geometry.type === 'MultiPolygon') {
		const polygonFeature: TurfFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: geometry.coordinates[0],
			},
			properties: feature.properties || {},
		};
		const centerPoint = center(polygonFeature);
		return centerPoint.geometry.coordinates as [number, number];
	} else if (geometry.type === 'Point') {
		if (
			Array.isArray(geometry.coordinates) &&
			geometry.coordinates.length === 2 &&
			typeof geometry.coordinates[0] === 'number'
		) {
			return geometry.coordinates as [number, number];
		}
	}
	return undefined;
}
