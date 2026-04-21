import { AppSharedState } from '../state.models';
import { ActionMapLayerClearSelection } from '../state.models.actions';
import { getMapByKey } from '../selectors/getMapByKey';
/**
 * Reducer to atomically clear all feature keys from a map layer selection.
 *
 * Unlike dispatching MAP_LAYER_REMOVE_FEATURE_KEY N times (N state updates, N re-renders),
 * this wipes featureKeys and featureKeyColourIndexPairs in a single state update.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerClearSelection} action - The action containing mapKey and layerKey.
 * @returns {AppSharedState} - Updated state with the selection cleared atomically.
 */
export const reduceHandlerClearLayerSelection = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerClearSelection
): T => {
	const { payload } = action;
	if (!payload) throw new Error('No payload provided for clearing selection');

	const { mapKey, layerKey } = payload;

	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	const selectionKey = mapToChange.renderingLayers.find((layer) => layer.key === layerKey)?.selectionKey;

	if (!selectionKey) {
		// Layer has no selectionKey — nothing to clear
		return state;
	}

	const selections = Array.isArray(state.selections) ? state.selections : [];

	const updatedSelections = selections.map((selection) =>
		selection.key === selectionKey
			? { ...selection, featureKeys: [], featureKeyColourIndexPairs: {} }
			: selection
	);

	return { ...state, selections: updatedSelections };
};
