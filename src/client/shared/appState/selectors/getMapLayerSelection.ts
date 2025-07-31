import { Selection } from '../../models/models.selections';
import { AppSharedState } from '../state.models';

/**
 * Returns the selection object from state.selections for the specified mapKey and layerKey.
 *
 * This selector finds the map by mapKey, then finds the rendering layer by layerKey,
 * retrieves its selectionKey, and returns the corresponding selection object from state.selections.
 *
 * @param {AppSharedState} state - The shared application state.
 * @param {string} mapKey - The key of the map.
 * @param {string} layerKey - The key of the layer.
 * @returns {Selection | undefined} The selection object for the layer, or undefined if not found.
 */
export const getMapLayerSelection = (
	state: AppSharedState,
	mapKey: string,
	layerKey: string
): Selection | undefined => {
	// Ensure selections is an array
	if (!Array.isArray(state.selections)) return undefined;

	// Find the map by its key
	const map = state.maps?.find((m) => m.key === mapKey);

	// Find the rendering layer by its key within the map
	const layer = map?.renderingLayers?.find((renderingLayer) => renderingLayer.key === layerKey);

	// Get the selectionKey from the layer
	const selectionKey = layer?.selectionKey;
	if (!selectionKey) return undefined;

	// Find and return the selection object with the matching key
	return state.selections.find((selection) => selection && selection.key === selectionKey);
};
