import type { PickingInfo } from '@deck.gl/core';

/** A single [longitude, latitude] coordinate pair. */
export type GeometryCoordinate = [number, number];

/** Ordered list of geometry (polygon / circle) coordinates. */
export type GeometryCoordinates = GeometryCoordinate[];

/** Supported drawing modes. */
export type DrawingMode = 'polygon' | 'circle' | 'line';

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

