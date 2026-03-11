import { PolygonCoordinates, PolygonDragInfo } from './polygonDrawingTypes';

interface OnDragParams {
    info: PolygonDragInfo;
    polygonCoordinates: PolygonCoordinates;
    setPolygonCoordinates: (coords: PolygonCoordinates) => void;
}

/**
 * Handles dragging of polygon vertices.
 * Updates the coordinate of the dragged vertex in real-time.
 */
export const onPolygonDrag = ({
    info,
    polygonCoordinates,
    setPolygonCoordinates,
}: OnDragParams) => {
    // Safety check
    if (!info) return;

    const { coordinate, index } = info;

    // Validate that we are dragging a valid vertex index
    if (typeof index !== 'number' || index < 0 || index >= polygonCoordinates.length) return;

    // Create a copy of coordinates and update the specific vertex position
    // This allows real-time visual feedback while dragging
    const newCoords = [...polygonCoordinates];
    newCoords[index] = [coordinate[0], coordinate[1]];
    setPolygonCoordinates(newCoords);
};

