import { PolygonCoordinates, PolygonDragInfo, DrawingMode } from './polygonDrawingTypes';

interface OnDragParams {
	info: PolygonDragInfo;
	polygonCoordinates: PolygonCoordinates;
	setPolygonCoordinates: (coords: PolygonCoordinates) => void;
	mode: DrawingMode;
}

/**
 * Handles dragging of polygon vertices.
 * Updates the coordinate of the dragged vertex in real-time.
 */
export const onPolygonDrag = ({
	                              info,
	                              polygonCoordinates,
	                              setPolygonCoordinates,
	                              mode,
                              }: OnDragParams) => {
	// Safety check
	if (!info) return;

	const { coordinate, index } = info;

	// Validate drag info shape: index must be a number and coordinate a numeric [x, y]
	if (
		!Array.isArray(coordinate) ||
		coordinate.length < 2 ||
		typeof coordinate[0] !== 'number' ||
		typeof coordinate[1] !== 'number'
	) {
		return;
	}

	// Validate that we are dragging a valid vertex index
	if (index < 0 || index >= polygonCoordinates.length) return;

	const newCoords = [... polygonCoordinates];

	if (mode === 'circle') {
		if (index === 0) {
			// Dragging Center: Move the whole circle (center + radius point)
			const dx = coordinate[0] - polygonCoordinates[0][0];
			const dy = coordinate[1] - polygonCoordinates[0][1];

			newCoords[0] = [coordinate[0], coordinate[1]];
			if (newCoords[1]) {
				newCoords[1] = [newCoords[1][0] + dx, newCoords[1][1] + dy];
			}
		} else if (index === 1) {
			// Dragging Radius Point: Just move the point to resize radius
			newCoords[1] = [coordinate[0], coordinate[1]];
		}
	} else {
		// Create a copy of coordinates and update the specific vertex position
		// This allows real-time visual feedback while dragging
		newCoords[index] = [coordinate[0], coordinate[1]];
	}

	setPolygonCoordinates(newCoords);
};

