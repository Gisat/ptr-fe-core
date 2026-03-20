import { PolygonCoordinates, PolygonClickInfo, DrawingMode } from './polygonDrawingTypes';

interface OnClickParams {
    info: PolygonClickInfo;
    polygonCoordinates: PolygonCoordinates;
    isClosed: boolean;
    setPolygonCoordinates: (coords: PolygonCoordinates) => void;
    setIsClosed: (closed: boolean) => void;
    mode: DrawingMode;
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
    mode,
}: OnClickParams) => {
    // If polygon is already closed, prevent adding more points.
    // Edit mode (dragging existing points) is handled separately.
    if (isClosed) return;

    // Safety check for info
    if (!info) return;

    const coordinate = info.coordinate;
    const clickedLayerId = info.sourceLayer?.id ?? info.layer?.id ?? '';
    const clickedIndex =
        typeof info.index === 'number'
            ? info.index
            : typeof info.object?.index === 'number'
              ? info.object.index
              : undefined;

    // Check if the user clicked on an existing vertex
    if (clickedLayerId.includes('vertex-layer')) {
        // If clicking on the first point (index 0) and we have enough points (>=3), close the polygon
        if (mode === 'polygon' && clickedIndex === 0 && polygonCoordinates.length >= 3) {
            setIsClosed(true);
            return;
        }
        // If clicked on any vertex, do not add a new point
        // This prevents adding points on top of existing ones
        return;
    }

    // Add new point at clicked coordinate
    if (coordinate) {
        if (mode === 'circle') {
            const newCoords = [...polygonCoordinates, coordinate as [number, number]];
            setPolygonCoordinates(newCoords);
            // Circle is defined by center and one edge point (radius)
            if (newCoords.length === 2) {
                setIsClosed(true);
            }
        } else {
            setPolygonCoordinates([...polygonCoordinates, coordinate as [number, number]]);
        }
    }
};
