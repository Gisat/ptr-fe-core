import {
	LAYER_ID_BBOX,
	LAYER_ID_BBOX_LINES,
	HOVER_BLOCKED,
	HOVER_BORDER_HORIZONTAL,
	HOVER_BORDER_VERTICAL,
	HOVER_LAYER
} from '../constants';
import { isPointInPolygon } from '../helpers';
import { BboxEnclosedPoints, BboxPoint, BboxPoints, Coordinate, HoverInfo } from '../types';
import { addPointToMap } from './addPointToMap';

/**
* Interface for the onHover function props.
*/
interface OnHoverProps {
	/** Information about the hover event. */
	info: HoverInfo;
	/** Updated available area as an array of coordinates. */
	updatedAvailableArea: BboxEnclosedPoints | null;
	/** Current coordinates of the active bounding box. */
	activeBboxPoints: BboxPoints | BboxPoint | [];
	/** Minimum area required for the bounding box. */
	minBorderRange: number;
	/** Indicates if the edit mode is active. */
	editModeIsActive: boolean;
	/** Function to set the bounding box hover state. */
	setBboxIsHovered: (state: string | boolean) => void;
	/** Function to set the active bounding box points. */
	setActiveBboxPoints: (points: BboxPoints | BboxPoint | []) => void;
	/** Function to set predicted hovered points. */
	setPredictedHoveredPoints: (points: BboxPoints | null) => void;
	/** Callback function to handle changes in bounding box coordinates. */
	onBboxCoordinatesChange: (bbox: BboxPoints | BboxPoint | null) => void;
}

/**
* Handles hover events on a bounding box layer.
* 
* @param {OnHoverProps} props - The props for the onHover function.
*/
export const onHover = ({
	info,
	updatedAvailableArea,
	activeBboxPoints,
	minBorderRange,
	editModeIsActive,
	setBboxIsHovered,
	setActiveBboxPoints,
	setPredictedHoveredPoints,
	onBboxCoordinatesChange
}: OnHoverProps) => {
	// Check if the coordinate information is available
	if (!info?.coordinate) return;

	const isInsideArea = isPointInPolygon(updatedAvailableArea, info.coordinate);
	let isLargeEnough = true;

	// If there is one active bounding box point, check size and add point to the map
	if (activeBboxPoints.length === 1) {
			const currentPoint = info.coordinate;
			const latDiff = activeBboxPoints[0][0] - currentPoint[0];
			const longDiff = activeBboxPoints[0][1] - currentPoint[1];
			isLargeEnough = (latDiff > minBorderRange || latDiff < -minBorderRange) && 
											(longDiff > minBorderRange || longDiff < -minBorderRange);
			addPointToMap({
					coordinates: currentPoint,
					activeBboxPoints,
					isDraft: true,
					setActiveBboxPoints,
					setPredictedHoveredPoints,
					onFinishDragging: onBboxCoordinatesChange
			});
	}

	// Check conditions for hover state
	if ((!isInsideArea && editModeIsActive && updatedAvailableArea) || !isLargeEnough) {
			setBboxIsHovered(HOVER_BLOCKED); // Set hover state to blocked
	} else if (info?.object?.properties?.name === LAYER_ID_BBOX_LINES && editModeIsActive) {
			const coordinates = info.object.geometry.coordinates[0].map(coord => [coord[0], coord[1]] as Coordinate);
			setBboxIsHovered(determineBorderHover(coordinates)); // Determine hover state based on the coordinates
	} else if (info?.layer?.id === LAYER_ID_BBOX) {
			setBboxIsHovered(HOVER_LAYER); // Layer hover state
	} else {
			setBboxIsHovered(false); // Reset hover state
	}
};

/**
* Determines the hover state for borders.
* 
* @param {Coordinate[]} coordinates - The coordinates of the border.
* @returns {string} The hover state.
*/
const determineBorderHover = (coordinates: Coordinate[]): string => {
	if (coordinates[0][0] === coordinates[1][0]) {
			return HOVER_BORDER_HORIZONTAL; // Horizontal border hover
	} else {
			return HOVER_BORDER_VERTICAL; // Vertical border hover
	}
};