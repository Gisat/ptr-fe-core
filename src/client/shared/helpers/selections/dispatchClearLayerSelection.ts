import { Dispatch } from 'react';
import { ActionMapLayerRemoveFeatureKey } from '../../appState/state.models.actions';
import { StateActionType } from '../../appState/enum.state.actionType';
import { AppSharedState } from '../../appState/state.models';
import { getMapLayerSelection } from '../../appState/selectors/getMapLayerSelection';

/**
 * Dispatches MAP_LAYER_REMOVE_FEATURE_KEY for every currently selected feature key
 * on the given layer, effectively clearing the entire selection in one call.
 *
 * WHY per-key dispatches instead of GLOBAL_STATE_UPDATE:
 * GLOBAL_STATE_UPDATE merges payload via:
 *   deduplicateByKey([...state.selections, ...payload.selections])
 * state.selections is prepended first → existing selection always wins deduplication
 * → the new empty replacement is silently discarded.
 * MAP_LAYER_REMOVE_FEATURE_KEY uses its own dedicated reducer that correctly mutates
 * the selection in place.
 *
 * TODO: Replace with a single MAP_LAYER_CLEAR_SELECTION once that action exists.
 */
export function dispatchClearLayerSelection(
	dispatch: Dispatch<any>,
	state: AppSharedState,
	mapKey: string,
	layerKey: string
): void {
	const selection = getMapLayerSelection(state, mapKey, layerKey);
	selection?.featureKeys?.forEach((featureKey) => {
		dispatch({
			type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
			payload: { mapKey, layerKey, featureKey },
		} as ActionMapLayerRemoveFeatureKey);
	});
}
