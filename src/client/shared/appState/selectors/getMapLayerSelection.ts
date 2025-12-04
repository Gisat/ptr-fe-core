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
	if (!Array.isArray(state.selections)) return undefined;

	const selectionKey = state.maps
		?.find((map) => map.key === mapKey)
		?.renderingLayers?.find((renderingLayer) => renderingLayer.key === layerKey)?.selectionKey;

	return selectionKey
		? state.selections.find((selection) => selection?.key === selectionKey)
		: undefined;
};
