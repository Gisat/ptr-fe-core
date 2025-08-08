import { useMemo } from 'react';
import { getGroundResolution } from './helper.getGroundResolution';
import { getValueForScaleInMeters } from './helper.getValueForScaleInMeters';
import { getFormattedLabel } from './helper.getFormattedLabel';

/**
 * Custom hook to calculate scale bar properties for a map.
 *
 * @param {number} latitude - The latitude of the map's center in degrees.
 * @param {number} zoom - The zoom level of the map.
 * @param {number} maxWidth - The maximum width of the scale bar in pixels.
 * @returns {Object} An object containing scale bar properties:
 * - `onePxInMeters`: The distance in meters represented by one pixel.
 * - `maxScaleWidthInMeters`: The maximum scale width in meters.
 * - `valueForScaleInMeters`: A rounded scale value in meters suitable for display.
 * - `scaleWidth`: The width of the scale bar in pixels.
 * - `label`: A human-readable label for the scale bar (e.g., "500 m" or "1.5 km").
 */
export const useScaleBar = (
	latitude: number,
	zoom: number,
	maxWidth: number
): {
	onePxInMeters: number;
	maxScaleWidthInMeters: number;
	valueForScaleInMeters: number;
	scaleWidth: number;
	label: string;
} => {
	return useMemo(() => {
		const onePxInMeters: number = getGroundResolution(latitude, zoom);
		const maxScaleWidthInMeters: number = maxWidth * onePxInMeters;
		const valueForScaleInMeters: number = getValueForScaleInMeters(maxScaleWidthInMeters);
		const scaleWidth: number = maxWidth * (valueForScaleInMeters / maxScaleWidthInMeters);
		const label: string = getFormattedLabel(valueForScaleInMeters);

		return {
			onePxInMeters,
			maxScaleWidthInMeters,
			valueForScaleInMeters,
			scaleWidth,
			label,
		};
	}, [latitude, zoom, maxWidth]);
};
