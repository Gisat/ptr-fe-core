import { PolygonCoordinates, PolygonClickInfo } from './polygonDrawingTypes';

interface OnClickParams {
    info: PolygonClickInfo;
    polygonCoordinates: PolygonCoordinates;
    isClosed: boolean;
    setPolygonCoordinates: (coords: PolygonCoordinates) => void;
    setIsClosed: (closed: boolean) => void;
}

/**
 * Validates click events and either adds a new vertex or closes the polygon loop.
 */
export const onPolygonClick = ({
    info,
    polygonCoordinates,
    isClosed,
    setPolygonCoordinates,
    setIsClosed,
}: OnClickParams) => {
    // If polygon is already closed, prevent adding more points.
    // Edit mode (dragging existing points) is handled separately.
    if (isClosed) return;

    // Safety check for info
    if (!info) return;

    const { coordinate, index, layer } = info;

    // Check if the user clicked on an existing vertex
    if (layer && layer.id && layer.id.includes('vertex-layer')) {
        // If clicking on the first point (index 0) and we have enough points (>=3), close the polygon
        if (typeof index === 'number' && index === 0 && polygonCoordinates.length > 2) {
            setIsClosed(true);
            return;
        }
        // If clicked on any vertex, do not add a new point
        // This prevents adding points on top of existing ones
        return;
    }

    // Add new point at clicked coordinate
    if (coordinate) {
        setPolygonCoordinates([...polygonCoordinates, coordinate as [number, number]]);
    }
};

