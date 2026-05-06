import { PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { DrawingMode } from '../_types/geometryDrawingTypes';
import {
	buildCirclePolygon,
	haversineDistance,
	LineCapStyle,
} from '../_logic/lineBufferHelpers';

interface GeometryLayerProps {
	geometryCoordinates: [number, number][];
	isClosed: boolean;
	isActive: boolean;
	hoveredPointIndex: number | null;
	mode: DrawingMode;
	/** Buffer half-width in metres – used only in 'line' mode */
	bufferMeters?: number;
	/** End-cap style for line corridor – 'round' (default) or 'flat' */
	capStyle?: LineCapStyle;
}

/**
 * Generates deck.gl layers for displaying and editing a geometry (polygon or circle).
 */
export const geometryLayer = ({
	geometryCoordinates,
	isClosed,
	isActive,
	hoveredPointIndex,
	mode,
	bufferMeters = 0,
	capStyle = 'round' as LineCapStyle,
}: GeometryLayerProps) => {
	if (!geometryCoordinates) return [];

	const layers: any[] = [];

	if (mode === 'line') {
		// ── Corridor buffer polygon ─────────────────────────────────────────────
		if (bufferMeters > 0 && geometryCoordinates.length >= 2) {
			const capRounded = capStyle === 'round';

			// Fill layer — semi-transparent blue on top of the outline.
			layers.push(
				new PathLayer({
					id: 'line-buffer-layer',
					data: [{ path: geometryCoordinates }],
					getPath: (_data: any) => _data.path,
					getColor: [0, 150, 255, 100],
					getWidth: bufferMeters * 2,
					widthUnits: 'meters',
					widthMinPixels: 2,
					capRounded,
					jointRounded: true,  // joints are always round regardless of capStyle
					pickable: false,
					updateTriggers: {
						getWidth: [bufferMeters],
						capRounded: [capStyle],
					},
				})
			);
		}

		// ── Polyline path ───────────────────────────────────────────────────────
		if (geometryCoordinates.length >= 2) {
			layers.push(
				new PathLayer({
					id: 'line-path-layer',
					data: [{ path: geometryCoordinates }],
					getPath: (_data: any) => _data.path,
					getColor: [0, 180, 60],
					widthMinPixels: 2,
					pickable: false,
				})
			);
		}
	} else if (mode === 'circle') {
		// ── Circle fill ────────────────────────────────────────────────────────
		// Use PolygonLayer with a geodesic polygon instead of ScatterplotLayer.
		// ScatterplotLayer renders circles using a flat-earth Mercator approximation;
		// for large circles this causes the edge point to appear off the circle at
		// extreme zoom levels. The geodesic polygon uses the same spherical maths as
		// getDistance, so the edge vertex is guaranteed to sit on the boundary.
		if (isClosed && geometryCoordinates.length === 2) {
			const radius = haversineDistance(geometryCoordinates[0], geometryCoordinates[1]);
			const circlePolygon = buildCirclePolygon(geometryCoordinates[0], radius);
			layers.push(
				new PolygonLayer({
					id: 'circle-fill-layer',
					data: [{ polygon: circlePolygon }],
					getPolygon: (_data: any) => _data.polygon,
					getFillColor: [0, 150, 255, 100],
					getLineColor: [0, 100, 255],
					pickable: isActive,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 2,
					autoHighlight: isActive,
					highlightColor: [0, 0, 255, 100],
				})
			);
		}

		// ── Radius line ────────────────────────────────────────────────────────
		// Only shown while the user is actively drawing / editing (isActive).
		// Hidden when the circle is complete and editing mode is off.
		if (isActive && geometryCoordinates.length === 2) {
			layers.push(
				new PathLayer({
					id: 'circle-radius-line',
					data: [{ path: geometryCoordinates }],
					getPath: (_data: any) => _data.path,
					getColor: [0, 0, 0, 100],
					widthMinPixels: 1,
					pickable: false,
				})
			);
		}
	} else {
		// ── Polygon mode ────────────────────────────────────────────────────────
		// Filled polygon – rendered when the loop is closed.
		if (isClosed && geometryCoordinates.length >= 3) {
			layers.push(
				new PolygonLayer({
					id: 'polygon-fill-layer',
					data: [{ polygon: geometryCoordinates }],
					getPolygon: (_data: any) => _data.polygon,
					getFillColor: [0, 150, 255, 100],
					getLineColor: [0, 100, 255],
					pickable: isActive,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 2,
					autoHighlight: true,
					highlightColor: [0, 0, 255, 100],
				})
			);
		} else if (geometryCoordinates.length > 0) {
			// Open path – connects the vertices placed so far while drawing.
			layers.push(
				new PathLayer({
					id: 'polygon-path-layer',
					data: [{ path: geometryCoordinates }],
					getPath: (_data: any) => _data.path,
					getColor: [0, 0, 255],
					widthMinPixels: 2,
					pickable: false,
				})
			);
		}
	}

	// ── Vertex handles ─────────────────────────────────────────────────────────
	// Draggable points; first vertex highlighted red when polygon is closeable.
	if (isActive && geometryCoordinates.length > 0) {
		layers.push(
			new ScatterplotLayer({
				id: 'vertex-layer',
				data: geometryCoordinates.map((_coord, _index) => ({ position: _coord, index: _index })),
				getPosition: (_data: any) => _data.position,
				getRadius: 8,
				radiusUnits: 'pixels',
				getFillColor: (_data: any) => {
					if (_data.index === hoveredPointIndex) return [255, 255, 0];
					if (mode === 'polygon') {
						// Highlight first vertex red when loop is closeable (unclosed & > 2 points)
						return (_data.index === 0 && !isClosed && geometryCoordinates.length > 2)
							? [255, 0, 0]
							: [255, 255, 255];
					}
					return [255, 255, 255];
				},
				stroked: true,
				getLineColor: [0, 0, 0],
				lineWidthMinPixels: 1,
				radiusMinPixels: 5,
				pickable: true,
				autoHighlight: true,
				highlightColor: [255, 0, 0, 255],
				updateTriggers: {
					getFillColor: [isClosed, geometryCoordinates.length, hoveredPointIndex, mode],
				},
			})
		);
	}

	return layers;
};

