import { AppSharedState } from '../state.models';

/**
 * Returns the selection object from state.selections for the specified mapKey and layerKey.
 * @param state - The shared application state.
 * @param mapKey - The key of the map.
 * @param layerKey - The key of the layer.
 * @returns {object | undefined} The selection object or undefined if not found.
 */
export const getMapLayerSelection = (state: AppSharedState, mapKey: string, layerKey: string): any | undefined => {
	if (!Array.isArray(state.selections)) return undefined;
	// Find the map and layer to get the selectionKey
	const map = state.maps?.find((m) => m.key === mapKey);
	const layer = map?.renderingLayers?.find((l) => l.key === layerKey);
	const selectionKey = layer?.selectionKey;
	if (!selectionKey) return undefined;
	return state.selections.find((sel) => sel && sel.key === selectionKey);
};
