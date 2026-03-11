import { PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';

interface PolygonLayerProps {
	polygonCoordinates: [number, number][];
	isClosed: boolean;
	isActive: boolean;
	hoveredPointIndex: number | null;
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
                             }: PolygonLayerProps) => {

	// Safety check: Don't render if coordinates are missing
	if (!polygonCoordinates) return [];

	const layers: any[] = [];

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
					// Highlight first point in red if loop is closeable (unclosed & > 2 points)
					return (_data.index === 0 && !isClosed && polygonCoordinates.length > 2) ? [255, 0, 0] : [255, 255, 255];
				},
				getLineColor: [0, 0, 0],
				lineWidthMinPixels: 1,
				radiusMinPixels: 5,
				pickable: true,
				autoHighlight: true,
				highlightColor: [255, 0, 0, 255],
				updateTriggers: {
					getFillColor: [isClosed, polygonCoordinates.length]
				}
			})
		);
	}

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

	return layers;
};
