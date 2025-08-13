import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getMapViewByKey } from '../../../shared/appState/selectors/getMapViewByKey';
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
	const mapView = getMapViewByKey(sharedState, stateMapKey);
	const scale = useScaleBar(mapView, maxWidth);

	if (!scale) {
		return null;
	}

	return (
		<div className="ptr-MapScale">
			<div className="ptr-MapScale-content" style={{ width: `${scale.width}px`, borderColor: color }}>
				<span style={{ color }}>{scale.label}</span>
			</div>
		</div>
	);
};
