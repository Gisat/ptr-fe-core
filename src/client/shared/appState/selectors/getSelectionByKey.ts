import { AppSharedState } from '../state.models';

/**
 * Returns the selection object from state.selections for the specified mapKey and layerKey.
 * @param state - The shared application state.
 * @param mapKey - The key of the map.
 * @param layerKey - The key of the layer.
 * @returns {object | undefined} The selection object or undefined if not found.
 */
export const getSelectionByKey = (state: AppSharedState, selectionKey: string): any | undefined => {
	if (!Array.isArray(state.selections)) return undefined;
	return state.selections.find((sel) => sel && sel.key === selectionKey);
};
