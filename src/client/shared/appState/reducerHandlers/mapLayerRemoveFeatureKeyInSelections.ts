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

	if (!payload) throw new Error('No payload provided for removing featureKey');
	const { mapKey, layerKey, featureKey } = payload;

	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	// Find the selectionKey for the layer
	let selectionKey: string | undefined = undefined;
	for (const layer of mapToChange.renderingLayers) {
		if (layer.key === layerKey) {
			selectionKey = layer.selectionKey;
			break;
		}
	}

	if (!selectionKey) {
		// No selectionKey found, nothing to remove
		return state;
	}

	// Remove the featureKey from the selection's featureKeys and featureKeyColourIndexPairs
	const updatedSelections = Array.isArray(state.selections)
		? state.selections.map((selection) => {
				if (selection && selection.key === selectionKey && Array.isArray(selection.featureKeys)) {
					const newFeatureKeys = selection.featureKeys.filter((key) => key !== featureKey);
					const { [featureKey]: _, ...newColourIndexPairs } = selection.featureKeyColourIndexPairs || {};
					return {
						...selection,
						featureKeys: newFeatureKeys,
						featureKeyColourIndexPairs: newColourIndexPairs,
					};
				}
				return selection;
			})
		: state.selections;

	return { ...state, selections: updatedSelections };
};
