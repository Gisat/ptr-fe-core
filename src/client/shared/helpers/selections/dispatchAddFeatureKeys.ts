import { Dispatch } from 'react';
import { ActionMapLayerAddFeatureKey } from '../../appState/state.models.actions';
import { StateActionType } from '../../appState/enum.state.actionType';
/**
 * Dispatches MAP_LAYER_ADD_FEATURE_KEY for each key in the provided array.
 *
 * WHY per-key dispatches instead of GLOBAL_STATE_UPDATE:
 * GLOBAL_STATE_UPDATE merges via deduplicateByKey([...state.selections, ...payload.selections])
 * — existing selection always wins, so a newly built object for a layer that already
 * has a selection entry is silently discarded.
 *
 * TODO: Replace with MAP_LAYER_SET_FEATURE_KEYS bulk action once added to ptr-fe-core.
 */
export function dispatchAddFeatureKeys(
	dispatch: Dispatch<any>,
	mapKey: string,
	layerKey: string,
	featureKeys: Array<string | number>
): void {
	featureKeys.forEach((featureKey) => {
		dispatch({
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: { mapKey, layerKey, featureKey },
		} as ActionMapLayerAddFeatureKey);
	});
}
