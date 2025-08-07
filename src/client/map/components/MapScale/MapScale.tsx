import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getMapByKey } from '../../../shared/appState/selectors/getMapByKey';
import { useMemo } from 'react';
import './MapScale.css';

/**
 * Calculates the ground resolution (meters per pixel) for a given latitude and zoom level.
 *
 * Ground resolution is the distance on the ground that is represented by one pixel on the map.
 * It varies depending on the latitude due to the curvature of the Earth and the map projection.
 *
 * @param latitude - The latitude in degrees (between -90 and 90).
 * @param zoomLevel - The zoom level (typically between 0 and 21 for web maps).
 * @returns The ground resolution in meters per pixel.
 */
function getGroundResolution(latitude: number, zoomLevel: number): number {
	const earthRadius = 6378137; // in meters (used in Web Mercator projection)
	const tileSize = 512; // pixels per tile at zoom level 0

	// Convert latitude from degrees to radians
	const latRad = (latitude * Math.PI) / 180;

	// Calculate ground resolution
	return (Math.cos(latRad) * 2 * Math.PI * earthRadius) / (tileSize * Math.pow(2, zoomLevel));
}

/**
 * Calculates the order of magnitude of a given number.
 * The order of magnitude is the power of ten that most closely approximates the number.
 *
 * @param number - The input number for which the order of magnitude is calculated.
 * @returns The order of magnitude of the input number.
 */
function getOrderOfMagnitude(number: number): number {
	return Math.floor(Math.log(number) / Math.LN10 + 0.000000001);
}

/**
 * Formats a numeric value into a human-readable string with appropriate units.
 * Values less than 1000 are displayed in meters (m), while larger values are converted to kilometers (km).
 *
 * @param value - The numeric value to format.
 * @returns The formatted string with units (e.g., "500 m" or "1.5 km").
 */
function getFormattedLabel(value: number): string {
	if (value < 1000) {
		return `${value} m`;
	} else {
		return `${(value / 1000).toLocaleString()} km`;
	}
}

/**
 * Determines a suitable scale value in meters for display purposes.
 * The function normalizes the input value and adjusts it to a rounded, human-readable scale.
 *
 * @param maxScaleWidthInMeters - The maximum scale width in meters.
 * @returns A rounded scale value in meters suitable for display.
 */
function getValueForScaleInMeters(maxScaleWidthInMeters: number): number {
	const orderOfMagnitude = getOrderOfMagnitude(maxScaleWidthInMeters);
	const coeff = Math.pow(10, orderOfMagnitude);
	const normalizedValue = maxScaleWidthInMeters / coeff;

	if (normalizedValue < 2) {
		return coeff;
	} else if (normalizedValue < 3) {
		return 2 * coeff;
	} else if (normalizedValue < 5) {
		return 3 * coeff;
	} else {
		return 5 * coeff;
	}
}

interface MapScaleProps {
	stateMapKey: string;
	maxWidth?: number; // Maximum width of the scale in pixels
	color?: string; // Color of the scale label and border
}

/**
 * Props for the MapScale component.
 *
 * @typedef {Object} MapScaleProps
 * @property {string} stateMapKey - The key identifying the map state.
 * @property {number} [maxWidth=150] - The maximum width of the scale in pixels.
 * @property {string} [color] - The color of the scale label and border.
 */

/**
 * A React component that renders a map scale based on the current map view and size.
 * The scale dynamically adjusts to the zoom level and latitude of the map.
 *
 * @param {MapScaleProps} props - The properties for the MapScale component.
 * @returns {JSX.Element | null} The rendered map scale or null if the map view/size is invalid.
 */
export const MapScale = ({ stateMapKey, color, maxWidth = 150 }: MapScaleProps) => {
	const [sharedState] = useSharedState();
	const mapState = getMapByKey(sharedState, stateMapKey);
	const { view } = mapState || {};
	if (!view) {
		console.warn(`Map with key "${stateMapKey}" does not have a view.`);
		return null;
	}

	const { zoom, latitude } = view;
	if (zoom === undefined || latitude === undefined) {
		console.warn(`Invalid map view parameters: zoom=${zoom}, latitude=${latitude}`);
		return null;
	}

	/**
	 * Calculates:
	 * - onePxInMeters: ground resolution (meters per pixel) at current latitude and zoom.
	 * - maxScaleWidthInMeters: maximum scale width in meters based on maxWidth in pixels.
	 * - valueForScaleInMeters: rounded, human-friendly scale value in meters.
	 * - scaleWidth: pixel width for the scale bar, proportional to the chosen scale value.
	 * - label: formatted string for display (e.g., "500 m" or "1500 km").
	 */
	const { scaleWidth, label } = useMemo(() => {
		const onePxInMeters = getGroundResolution(latitude, zoom);
		const maxScaleWidthInMeters = maxWidth * onePxInMeters;
		const valueForScaleInMeters = getValueForScaleInMeters(maxScaleWidthInMeters);
		const scaleWidth = maxWidth * (valueForScaleInMeters / maxScaleWidthInMeters);
		const label = getFormattedLabel(valueForScaleInMeters);
		return { onePxInMeters, maxScaleWidthInMeters, valueForScaleInMeters, scaleWidth, label };
	}, [latitude, zoom, maxWidth]);

	return (
		<div className="ptr-MapScale">
			<div className="ptr-MapScale-content" style={{ width: scaleWidth + 'px', borderColor: color }}>
				<span style={{ color }}>{label}</span>
			</div>
		</div>
	);
};
