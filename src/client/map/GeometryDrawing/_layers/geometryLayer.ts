import { PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { DrawingMode } from '../_types/geometryDrawingTypes';
import {
	buildCirclePolygon,
	haversineDistance,
	LineCapStyle,
} from '../_logic/lineBufferHelpers';

/**
 * RGBA colour tuple where each channel is an integer in 0..255.
 * Format: [red, green, blue, alpha].
 * Alpha is expressed on the same 0..255 scale (255 == opaque).
 */

export type ColorRGBA = [number, number, number, number];

/**
 * Optional visual style overrides for geometry rendering.
 * All fields are optional; when omitted sensible defaults are used.
 */
export interface GeometryStyle {
	pointRadius?: number;
	pointColor?: ColorRGBA;
	fillColor?: ColorRGBA;
	strokeWidth?: number;
	strokeColor?: ColorRGBA;
	radiusLineColor?: ColorRGBA;
	radiusLineWidth?: number;
	lineColor?: ColorRGBA;
	lineStrokeWidth?: number;
}

/**
 * Properties passed into the geometry composite layer generator.
 * These describe the current drawing state and optional style overrides.
 */
interface GeometryLayerProps {
	geometryCoordinates: [number, number][];
	isClosed: boolean;
	isActive: boolean;
	hoveredPointIndex: number | null;
	mode: DrawingMode;
	bufferMeters?: number;
	capStyle?: LineCapStyle;
	style?: GeometryStyle;
	selectedPointIndex?: number | null;
}

/**
 * Create deck.gl sub-layers for rendering and interacting with a geometry.
 *
 * Returned layers typically include:
 * - polygon/circle fill (PolygonLayer)
 * - drawing path (PathLayer)
 * - an invisible, pickable edge path (PathLayer) used to detect clicks on edges
 * - vertex handles (ScatterplotLayer)
 *
 * This function is pure and returns a new array of deck.gl Layer instances
 * for the current drawing state. It does not mutate inputs.
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
	                              selectedPointIndex = null,
                              }: GeometryLayerProps) => {
	if (!geometryCoordinates) return [];
	const {
		pointRadius = 8,
		pointColor = [255, 255, 255, 255] as ColorRGBA,
		fillColor = [0, 150, 255, 100] as ColorRGBA,
		strokeWidth = 2,
		strokeColor = [0, 100, 255, 255] as ColorRGBA,
		radiusLineColor = [0, 0, 0, 100] as ColorRGBA,
		radiusLineWidth = 1,
		lineColor = [0, 180, 60, 255] as ColorRGBA,
		lineStrokeWidth = 2,
	} = style;
	const layers: any[] = [];
	if (mode === 'line') {
		if (bufferMeters > 0 && geometryCoordinates.length >= 2) {
			const capRounded = capStyle === 'round';
			layers.push(new PathLayer({
				id: 'line-buffer-layer',
				data: [{ path: geometryCoordinates }],
				getPath: (data: any) => data.path,
				getColor: fillColor,
				getWidth: bufferMeters * 2,
				widthUnits: 'meters',
				widthMinPixels: 2,
				capRounded,
				jointRounded: true,
				pickable: false,
				updateTriggers: { getWidth: [bufferMeters], capRounded: [capStyle] }
			}));
		}
		if (geometryCoordinates.length >= 2) {
			layers.push(new PathLayer({
				id: 'line-path-layer',
				data: [{ path: geometryCoordinates }],
				getPath: (data: any) => data.path,
				getColor: lineColor,
				widthMinPixels: lineStrokeWidth,
				pickable: false
			}));
		}
	} else if (mode === 'circle') {
		if (isClosed && geometryCoordinates.length === 2) {
			const radius = haversineDistance(geometryCoordinates[0], geometryCoordinates[1]);
			const circlePolygon = buildCirclePolygon(geometryCoordinates[0], radius);
			layers.push(new PolygonLayer({
				id: 'circle-fill-layer',
				data: [{ polygon: circlePolygon }],
				getPolygon: (data: any) => data.polygon,
				getFillColor: fillColor,
				getLineColor: strokeColor,
				pickable: isActive,
				stroked: true,
				filled: true,
				lineWidthMinPixels: strokeWidth,
				autoHighlight: isActive,
				highlightColor: [0, 0, 255, 100]
			}));
		}
		if (isActive && geometryCoordinates.length === 2) {
			layers.push(new PathLayer({
				id: 'circle-radius-line',
				data: [{ path: geometryCoordinates }],
				getPath: (data: any) => data.path,
				getColor: radiusLineColor,
				widthMinPixels: radiusLineWidth,
				pickable: false
			}));
		}
	} else {
		if (isClosed && geometryCoordinates.length >= 3) {
			layers.push(new PolygonLayer({
				id: 'polygon-fill-layer',
				data: [{ polygon: geometryCoordinates }],
				getPolygon: (data: any) => data.polygon,
				getFillColor: fillColor,
				getLineColor: strokeColor,
				pickable: isActive,
				stroked: true,
				filled: true,
				lineWidthMinPixels: strokeWidth,
				autoHighlight: true,
				highlightColor: [0, 0, 255, 100]
			}));
		} else if (geometryCoordinates.length > 0) {
			layers.push(new PathLayer({
				id: 'polygon-path-layer',
				data: [{ path: geometryCoordinates }],
				getPath: (data: any) => data.path,
				getColor: [0, 0, 255],
				widthMinPixels: 2,
				pickable: false
			}));
		}
	}
	const hasEdges =
		isActive &&
		mode === 'polygon' &&
		isClosed &&
		geometryCoordinates.length >= 3;
	if (hasEdges) {
		// hasEdges guarantees mode === 'polygon' && isClosed, so always close the path.
		const edgePath = [...geometryCoordinates, geometryCoordinates[0]];
		layers.push(new PathLayer({
			id: 'edge-pick-layer',
			data: [{ path: edgePath }],
			getPath: (data: any) => data.path,
			getColor: [0, 0, 0, 1],
			getWidth: 16,
			widthUnits: 'pixels',
			widthMinPixels: 16,
			pickable: true,
			updateTriggers: { data: [geometryCoordinates, isClosed] }
		}));
	}
	if (isActive && geometryCoordinates.length > 0) {
		layers.push(new ScatterplotLayer({
			id: 'vertex-layer',
			data: geometryCoordinates.map((coord, vertexIndex) => ({ position: coord, index: vertexIndex })),
			getPosition: (data: any) => data.position,
			getRadius: pointRadius,
			radiusUnits: 'pixels',
			getFillColor: (data: any) => {
				if (data.index === selectedPointIndex) return [255, 0, 0, 255];
				if (data.index === hoveredPointIndex) return [255, 255, 0, 255];
				if (mode === 'polygon' && isActive) {
					return (data.index === 0 && !isClosed && geometryCoordinates.length > 2) ? [255, 0, 0, 255] : pointColor;
				}
				return pointColor;
			},
			stroked: true,
			getLineColor: [0, 0, 0, 255],
			lineWidthMinPixels: 1,
			radiusMinPixels: 5,
			pickable: true,
			autoHighlight: false,
			updateTriggers: { getFillColor: [isClosed, geometryCoordinates.length, hoveredPointIndex, selectedPointIndex, mode, pointColor, isActive] },
		}));
	}
	return layers;
};
