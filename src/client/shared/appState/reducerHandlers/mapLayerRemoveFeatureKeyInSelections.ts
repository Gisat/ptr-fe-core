import { AppSharedState } from '../state.models';
import { ActionMapLayerRemoveFeatureKey } from '../state.models.actions';
import { getMapByKey } from '../selectors/getMapByKey';

/**
 * Reducer to remove a featureKey from the selection object in state.selections
 * for a specific map and layer. Also removes the featureKey from featureKeyColourIndexPairs.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerRemoveFeatureKey} action - The action containing mapKey, layerKey, and featureKey.
 * @returns {AppSharedState} - The updated application state with the featureKey removed from the selection.
 * @throws {Error} If the payload is missing or the map/layer is not found.
 */
export const reduceHandlerRemoveFeatureKeyInSelections = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerRemoveFeatureKey
): T => {
	const { payload } = action;

	// Ensure the payload is provided
	if (!payload) throw new Error('No payload provided for removing featureKey');
	const { mapKey, layerKey, featureKey } = payload;

	// Find the map to update
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	let selectionKey: string | undefined = undefined;

	// Find selectionKey for the target layer
	for (const layer of mapToChange.renderingLayers) {
		if (layer.key === layerKey) {
			selectionKey = layer.selectionKey;
			break;
		}
	}

	// Prepare a shallow copy of selections array for safe mutation
	const selections = Array.isArray(state.selections) ? [...state.selections] : [];

	if (selectionKey) {
		for (let i = 0; i < selections.length; i++) {
			if (selections[i] && selections[i].key === selectionKey) {
				// Remove the featureKey from featureKeys and featureKeyColourIndexPairs
				const newFeatureKeys = selections[i].featureKeys.filter((key: string) => key !== featureKey);
				const { [featureKey]: _, ...newColourIndexPairs } = selections[i].featureKeyColourIndexPairs || {};
				selections[i] = {
					...selections[i],
					featureKeys: newFeatureKeys,
					featureKeyColourIndexPairs: newColourIndexPairs,
				};
				break;
			}
		}
	}

	// Return the updated state with modified selections
	return { ...state, selections };
};
