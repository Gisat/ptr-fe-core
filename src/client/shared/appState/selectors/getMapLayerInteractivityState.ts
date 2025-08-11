import { AppSharedState } from '../state.models';

/**
 * Returns the isInteractive property from the rendering layer for the specified mapKey and layerKey.
 *
 * This selector finds the map by mapKey, then finds the rendering layer by layerKey,
 * and returns its isInteractive property.
 *
 * @param {AppSharedState} state - The shared application state.
 * @param {string} mapKey - The key of the map.
 * @param {string} layerKey - The key of the layer.
 * @returns {boolean | undefined} The isInteractive value for the layer, or undefined if not found.
 */
export const getMapLayerInteractivityState = (
	state: AppSharedState,
	mapKey: string,
	layerKey: string
): boolean | undefined => {
	// Find the map by its key
	const map = state.maps?.find((m) => m.key === mapKey);

	// Find the rendering layer by its key within the map
	const layer = map?.renderingLayers?.find((renderingLayer) => renderingLayer.key === layerKey);

	// Return the isInteractive property from the layer, or undefined if not found
	return layer?.isInteractive;
};
