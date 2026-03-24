import type { PickingInfo } from '@deck.gl/core';

/** A single [longitude, latitude] coordinate pair. */
export type PolygonCoordinate = [number, number];

/** Ordered list of polygon / circle coordinates. */
export type PolygonCoordinates = PolygonCoordinate[];

/** Supported drawing modes. */
export type DrawingMode = 'polygon' | 'circle';

/**
 * Picking info for polygon click and hover events.
 *
 * Uses indexed access types from Deck.gl {@link PickingInfo} to stay
 * type-safe without duplicating Deck.gl's own definitions.
 */
export interface PolygonClickInfo {
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
 * Only the fields required by {@link onPolygonDrag} are included.
 */
export interface PolygonDragInfo {
	coordinate: PolygonCoordinate;
	index: number;
}

