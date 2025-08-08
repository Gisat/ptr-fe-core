import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getMapByKey } from '../../../shared/appState/selectors/getMapByKey';
import { useScaleBar } from './hook.useScaleBar';
import './MapScale.css';

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

	const { scaleWidth, label } = useScaleBar(latitude, zoom, maxWidth);

	return (
		<div className="ptr-MapScale">
			<div className="ptr-MapScale-content" style={{ width: `${scaleWidth}px`, borderColor: color }}>
				<span style={{ color }}>{label}</span>
			</div>
		</div>
	);
};
