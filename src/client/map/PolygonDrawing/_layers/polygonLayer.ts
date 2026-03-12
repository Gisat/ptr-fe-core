import { PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { DrawingMode } from '../_logic/polygonDrawingTypes';

interface PolygonLayerProps {
	polygonCoordinates: [number, number][];
	isClosed: boolean;
	isActive: boolean;
	hoveredPointIndex: number | null;
	mode: DrawingMode;
}

function getDistance(coord1: [number, number], coord2: [number, number]): number {
	const toRad = (x: number) => x * Math.PI / 180;
	const R = 6371000; // Earth radius in meters

	const dLat = toRad(coord2[1] - coord1[1]);
	const dLon = toRad(coord2[0] - coord1[0]);
	const lat1 = toRad(coord1[1]);
	const lat2 = toRad(coord2[1]);

	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return R * c;
}

/**
 * Generates deck.gl layers for displaying and editing the polygon.
 *
 * @param props Props for generating layers
 * @returns Array of deck.gl layers
 */
export const polygonLayer = ({
	                             polygonCoordinates,
	                             isClosed,
	                             isActive,
	                             hoveredPointIndex,
	                             mode,
                             }: PolygonLayerProps) => {

	// Safety check: Don't render if coordinates are missing
	if (!polygonCoordinates) return [];

	const layers: any[] = [];

	if (mode === 'circle') {
		// Draw the circle area
		if (isClosed && polygonCoordinates.length === 2) {
			const radius = getDistance(polygonCoordinates[0], polygonCoordinates[1]);
			layers.push(
				new ScatterplotLayer({
					id: 'circle-fill-layer',
					data: [{position: polygonCoordinates[0], radius}],
					getPosition: (_data: any) => _data.position,
					getRadius: (_data: any) => _data.radius,
					getFillColor: [0, 150, 255, 100],
					getLineColor: [0, 100, 255],
					stroked: true,
					filled: true,
					lineWidthMinPixels: 2,
					pickable: true,
					autoHighlight: true,
					highlightColor: [0, 0, 255, 100],
				})
			);
		}

        // Draw separate path line for radius if needed
        if (polygonCoordinates.length === 2) {
            layers.push(
                new PathLayer({
                    id: 'circle-radius-line',
                    data: [{path: polygonCoordinates}],
                    getPath: (_data: any) => _data.path,
                    getColor: [0, 0, 0, 100],
                    widthMinPixels: 1,
                    pickable: false,
                    dashJustified: true,
                    getDashArray: [5, 5],
                    extensions: []
                })
            );
        }

	} else {
		// Polygon Mode
		// Layer for closed polygon (PolygonLayer)
		// Rendered when the loop is closed to show the area.
		if (isClosed && polygonCoordinates.length >= 3) {
			layers.push(
				new PolygonLayer({
					id: 'polygon-fill-layer',
					data: [{polygon: polygonCoordinates}],
					getPolygon: (_data: any) => _data.polygon,
					getFillColor: [0, 150, 255, 100],
					getLineColor: [0, 100, 255],
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 2,
					autoHighlight: true,
					highlightColor: [0, 0, 255, 100],
				})
			);
		}
			// Layer for open path (while drawing) (PathLayer)
		// Rendered while drawing to connect the points placed so far.
		else if (polygonCoordinates.length > 0) {
			layers.push(
				new PathLayer({
					id: 'polygon-path-layer',
					data: [{path: polygonCoordinates}],
					getPath: (_data: any) => _data.path,
					getColor: [0, 0, 255],
					widthMinPixels: 2,
					pickable: false,
				})
			);
		}
	}

	// Layer for vertices (ScatterplotLayer)
	// Allows dragging points and highlights the starting point for closing the loop.
	if (isActive && polygonCoordinates.length > 0) {
		layers.push(
			new ScatterplotLayer({
				id: 'vertex-layer',
				data: polygonCoordinates.map((_coord, _index) => ({position: _coord, index: _index})),
				getPosition: (_data: any) => _data.position,
				getRadius: 50, // TODO: Adjust radius based on zoom level for better UX
				getFillColor: (_data: any) => {
					// Highlight hovered point
					if (_data.index === hoveredPointIndex) return [255, 255, 0];

					if (mode === 'polygon') {
						// Highlight first point in red if loop is closeable (unclosed & > 2 points)
						return (_data.index === 0 && !isClosed && polygonCoordinates.length > 2) ? [255, 0, 0] : [255, 255, 255];
					} else {
					    // Circle: Center (0) and Edge (1). Maybe highlight Center differently?
					    return [255, 255, 255];
					}
				},
				stroked: true,
				getLineColor: [0, 0, 0],
				lineWidthMinPixels: 1,
				radiusMinPixels: 5,
				pickable: true,
				autoHighlight: true,
				highlightColor: [255, 0, 0, 255],
				updateTriggers: {
					getFillColor: [isClosed, polygonCoordinates.length, hoveredPointIndex, mode]
				}
			})
		);
	}

	return layers;
};
