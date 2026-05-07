import { PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { DrawingMode } from '../_types/geometryDrawingTypes';
import {
	buildCirclePolygon,
	haversineDistance,
	LineCapStyle,
} from '../_logic/lineBufferHelpers';

/** RGBA colour tuple – all four channels required (alpha: 0–255) */
export type ColorRGBA = [number, number, number, number];

export interface GeometryStyle {
	/** a) Vertex point radius in pixels – all modes */
	pointRadius?: number;
	/** b) Vertex point fill colour – all modes */
	pointColor?: ColorRGBA;
	/** c) Fill colour (with alpha) – all modes */
	fillColor?: ColorRGBA;
	/** d) Stroke/border width in pixels – polygon & circle only */
	strokeWidth?: number;
	/** d) Stroke/border colour – polygon & circle only */
	strokeColor?: ColorRGBA;
	/** e) Radius line colour – circle only */
	radiusLineColor?: ColorRGBA;
	/** f) Radius line width in pixels – circle only */
	radiusLineWidth?: number;
	/** g) Line colour – line mode only */
	lineColor?: ColorRGBA;
	/** h) Line stroke width in pixels – line mode only */
	lineStrokeWidth?: number;
}

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
	/** Optional visual style overrides */
	style?: GeometryStyle;
	/** When true, edit-points mode is active – shows edge midpoint ghosts (polygon & line only). */
	isEditingPoints?: boolean;
	/** Index of the currently hovered edge ghost (edit mode only). */
	hoveredEdgeIndex?: number | null;
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
	style = {},
	isEditingPoints = false,
	hoveredEdgeIndex = null,
}: GeometryLayerProps) => {
	if (!geometryCoordinates) return [];

	const {
		pointRadius = 8,
		pointColor = [255, 255, 255, 255],
		fillColor = [0, 150, 255, 100],
		strokeWidth = 2,
		strokeColor = [0, 100, 255, 255],
		radiusLineColor = [0, 0, 0, 100],
		radiusLineWidth = 1,
		lineColor = [0, 180, 60, 255],
		lineStrokeWidth = 2,
	} = style;

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
					getColor: fillColor,
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
					getColor: lineColor,
					widthMinPixels: lineStrokeWidth,
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
					getFillColor: fillColor,
					getLineColor: strokeColor,
					pickable: isActive,
					stroked: true,
					filled: true,
					lineWidthMinPixels: strokeWidth,
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
					getColor: radiusLineColor,
					widthMinPixels: radiusLineWidth,
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
					getFillColor: fillColor,
					getLineColor: strokeColor,
					pickable: isActive,
					stroked: true,
					filled: true,
					lineWidthMinPixels: strokeWidth,
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
	// Also shown in edit mode (isEditingPoints) so the user can click to delete.
	if ((isActive || isEditingPoints) && geometryCoordinates.length > 0) {
		layers.push(
			new ScatterplotLayer({
				id: 'vertex-layer',
				data: geometryCoordinates.map((_coord, _index) => ({ position: _coord, index: _index })),
				getPosition: (_data: any) => _data.position,
				getRadius: pointRadius,
				radiusUnits: 'pixels',
				getFillColor: (_data: any) => {
					if (_data.index === hoveredPointIndex) return [255, 255, 0, 255];
					if (mode === 'polygon' && isActive) {
						// Highlight first vertex red when loop is closeable (unclosed & > 2 points)
						return (_data.index === 0 && !isClosed && geometryCoordinates.length > 2)
							? [255, 0, 0, 255]
							: pointColor;
					}
					return pointColor;
				},
				stroked: true,
				getLineColor: [0, 0, 0, 255],
				lineWidthMinPixels: 1,
				radiusMinPixels: 5,
				pickable: true,
				autoHighlight: false,
				updateTriggers: {
					getFillColor: [isClosed, geometryCoordinates.length, hoveredPointIndex, mode, pointColor, isActive],
				},
			})
		);
	}

	// ── Edge midpoint ghosts (edit mode only, polygon & line) ──────────────────
	// Shown as semi-transparent dots at the midpoint of each edge.
	// Clicking one inserts a new vertex; hovering highlights it.
	if (isEditingPoints && mode !== 'circle' && geometryCoordinates.length >= 2) {
		const n = geometryCoordinates.length;
		// For a closed polygon include the closing edge (last → first); for line omit it.
		const edgeCount = (mode === 'polygon' && isClosed) ? n : n - 1;
		const edgeMidpoints = Array.from({ length: edgeCount }, (_, i) => {
			const a = geometryCoordinates[i];
			const b = geometryCoordinates[(i + 1) % n];
			return {
				position: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as [number, number],
				edgeIndex: i,
			};
		});

		layers.push(
			new ScatterplotLayer({
				id: 'edge-midpoint-layer',
				data: edgeMidpoints,
				getPosition: (_data: any) => _data.position,
				getRadius: 6,
				radiusUnits: 'pixels',
				getFillColor: (_data: any) =>
					_data.edgeIndex === hoveredEdgeIndex
						? [0, 200, 100, 255]   // highlighted: solid green
						: [0, 200, 100, 130],  // default: semi-transparent green
				stroked: true,
				getLineColor: [0, 0, 0, 180],
				lineWidthMinPixels: 1,
				radiusMinPixels: 4,
				pickable: true,
				autoHighlight: false,
				updateTriggers: {
					getFillColor: [hoveredEdgeIndex],
					data: [geometryCoordinates, isClosed],
				},
			})
		);
	}

	return layers;
};

