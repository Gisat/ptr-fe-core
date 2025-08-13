import { useMemo } from 'react';
import { getGroundResolution } from './helper.getGroundResolution';
import { getValueForScaleInMeters } from './helper.getValueForScaleInMeters';
import { getFormattedLabel } from './helper.getFormattedLabel';
import { MapView } from '../../../shared/models/models.mapView';

/**
 * Custom hook to calculate scale bar properties for a map.
 *
 * @param {number} maxWidth - The maximum width of the scale bar in pixels.
 * @param {MapView | null} mapView - The current map view object containing zoom and latitude.
 * @returns {Object|null} An object containing scale bar properties:
 * - `width`: The width of the scale bar in pixels.
 * - `label`: A human-readable label for the scale bar (e.g., "500 m" or "1.5 km").
 */
export const useScaleBar = (
	mapView: MapView | null,
	maxWidth: number
): {
	width: number;
	label: string;
} | null => {
	return useMemo(() => {
		if ((!mapView?.zoom && mapView?.zoom !== 0) || (!mapView?.latitude && mapView?.latitude !== 0)) {
			console.warn('MapView is not valid for scale bar calculation', mapView);
			return null;
		}

		const onePxInMeters: number = getGroundResolution(mapView.latitude, mapView.zoom);
		const maxScaleWidthInMeters: number = maxWidth * onePxInMeters;
		const valueForScaleInMeters: number = getValueForScaleInMeters(maxScaleWidthInMeters);
		const width: number = maxWidth * (valueForScaleInMeters / maxScaleWidthInMeters);
		const label: string = getFormattedLabel(valueForScaleInMeters);

		return {
			width,
			label,
		};
	}, [mapView, maxWidth]);
};
