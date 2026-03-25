import { GeometryCoordinates, GeometryDragInfo, DrawingMode } from '../_types/geometryDrawingTypes';

interface OnDragParams {
	info: GeometryDragInfo;
	geometryCoordinates: GeometryCoordinates;
	setGeometryCoordinates: (coords: GeometryCoordinates) => void;
	mode: DrawingMode;
}

/**
 * Handles dragging of geometry vertices.
 * Updates the coordinate of the dragged vertex in real-time.
 */
export const onGeometryDrag = ({
	info,
	geometryCoordinates,
	setGeometryCoordinates,
	mode,
}: OnDragParams) => {
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
	if (index < 0 || index >= geometryCoordinates.length) return;

	const newCoords = [...geometryCoordinates];

	if (mode === 'circle') {
		if (index === 0) {
			// Dragging center: move the whole circle (center + radius point)
			const dx = coordinate[0] - geometryCoordinates[0][0];
			const dy = coordinate[1] - geometryCoordinates[0][1];

			newCoords[0] = [coordinate[0], coordinate[1]];
			if (newCoords[1]) {
				newCoords[1] = [newCoords[1][0] + dx, newCoords[1][1] + dy];
			}
		} else if (index === 1) {
			// Dragging radius point: resize radius
			newCoords[1] = [coordinate[0], coordinate[1]];
		}
	} else {
		// Polygon: move the specific vertex
		newCoords[index] = [coordinate[0], coordinate[1]];
	}

	setGeometryCoordinates(newCoords);
};

