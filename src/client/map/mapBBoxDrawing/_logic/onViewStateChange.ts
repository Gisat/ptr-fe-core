import { BboxEnclosedPoints, BboxPoint, BboxPoints, Coordinate, ViewStateChangeInfo } from '../types';

/**
 * Interface for the onViewStateChange function props.
 */
interface OnViewStateChangeProps {
	/** Information about the view state change event. */
	viewInfo: ViewStateChangeInfo;
	/** Indicates if the map screen should be followed. */
	followMapScreen: boolean;
	/** Current coordinates of the active bounding box. */
	activeBboxPoints: BboxPoints | BboxPoint | [];
	/** Updated available area as an array of coordinates. */
	updatedAvailableArea: BboxEnclosedPoints | null;
	/** Previous dragged point coordinates. */
	previousDraggedPoint: number[] | null;
	/** Function to set the previous dragged point coordinates. */
	setPreviousDraggedPoint: (point: Coordinate) => void;
	/** Function to set the updated available area. */
	setUpdatedAvailableArea: (area: BboxEnclosedPoints | null) => void;
	/** Function to set the active bounding box points. */
	setActiveBboxPoints: (points: [] | BboxPoints | BboxPoint) => void;
	/** Callback function to handle changes in bounding box coordinates. */
	onBboxCoordinatesChange: (points: BboxPoints | BboxPoint | null) => void;
}

/**
 * Handles changes in the map's view state, updating the active bounding box points and the available area based on user interactions like dragging, zooming, or panning.
 * It calculates the difference in latitude and longitude from the previous position to adjust the positions of the bounding box points and available area accordingly.
 *
 * @param {OnViewStateChangeProps} props - The props for the onViewStateChange function.
 */
export const onViewStateChange = ({
	viewInfo,
	followMapScreen,
	activeBboxPoints,
	updatedAvailableArea,
	previousDraggedPoint,
	setPreviousDraggedPoint,
	setUpdatedAvailableArea,
	setActiveBboxPoints,
	onBboxCoordinatesChange,
}: OnViewStateChangeProps) => {
	if (
		followMapScreen &&
		viewInfo &&
		activeBboxPoints &&
		previousDraggedPoint &&
		(viewInfo.interactionState.isDragging || viewInfo.interactionState.isZooming || viewInfo.interactionState.isPanning)
	) {
		const originViewLat = viewInfo.oldViewState.latitude;
		const originViewLong = viewInfo.oldViewState.longitude;
		const newViewLat = viewInfo.viewState.latitude;
		const newViewLong = viewInfo.viewState.longitude;

		const latDif = newViewLat - (previousDraggedPoint[0] || originViewLat);
		const longDif = newViewLong - (previousDraggedPoint[1] || originViewLong);

		// Update bounding box points and available area based on the view change
		const movedPoints = activeBboxPoints.map((point) => {
			return [point[0] + longDif, point[1] + latDif];
		});

		if (updatedAvailableArea) {
			const movedBounds = updatedAvailableArea.map((point) => {
				return [point[0] + longDif, point[1] + latDif];
			});
			setUpdatedAvailableArea(movedBounds as BboxEnclosedPoints);
		}

		setPreviousDraggedPoint([newViewLat, newViewLong]);
		setActiveBboxPoints(movedPoints as BboxPoints);
		onBboxCoordinatesChange(movedPoints as BboxPoints);
	}
};
