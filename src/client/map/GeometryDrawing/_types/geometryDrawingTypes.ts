import type { PickingInfo } from '@deck.gl/core';

/** A single [longitude, latitude] coordinate pair. */
export type GeometryCoordinate = [number, number];

/** Ordered list of geometry (polygon / circle) coordinates. */
export type GeometryCoordinates = GeometryCoordinate[];

/** Supported drawing modes. */
export type DrawingMode = 'polygon' | 'circle' | 'line';

/**
 * Configures the keyboard keys used for vertex editing actions.
 * Passed as an optional prop so consuming applications can override defaults.
 */
export interface PointEditConfig {
	/** Key that deletes the selected vertex. Default: 'Delete' */
	deleteKey?: string;
	/** Key that deselects the selected vertex. Default: 'Escape' */
	deselectKey?: string;
}

/**
 * Cap style for the corridor ends.
 * - `'round'` — semicircular arc centred on the endpoint.
 * - `'flat'`  — straight perpendicular edge exactly at the endpoint.
 */
export type LineCapStyle = 'round' | 'flat';

/**
 * RGBA colour tuple where each channel is an integer in 0..255.
 * Format: [red, green, blue, alpha].
 * Alpha is expressed on the same 0..255 scale (255 == opaque).
 */
export type ColorRGBA = [number, number, number, number];

/**
 * Optional visual style overrides for geometry rendering. All fields are
 * optional; consuming applications may pass a partial object to override
 * defaults used by the rendering layer.
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
 * Picking info for geometry click and hover events.
 *
 * Uses indexed access types from Deck.gl {@link PickingInfo} to stay
 * type-safe without duplicating Deck.gl's own definitions.
 */
export interface GeometryClickInfo {
	coordinate: PickingInfo['coordinate'];
	object?: PickingInfo['object'];
	layer?: PickingInfo['layer'];
	index?: PickingInfo['index'];
	/** Present in composite-layer picks – the actual sub-layer that matched. */
	sourceLayer?: PickingInfo['sourceLayer'];
}

/**
 * Picking info for vertex drag events.
 *
 * Only the fields required by {@link onGeometryDrag} are included.
 */
export interface GeometryDragInfo {
	coordinate: GeometryCoordinate;
	index: number;
}
