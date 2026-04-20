import { Dispatch } from 'react';
import { ActionMapLayerSetFeatureKeys } from '../../appState/state.models.actions';
import { StateActionType } from '../../appState/enum.state.actionType';

/**
 * Dispatches MAP_LAYER_SET_FEATURE_KEYS — a single atomic action that replaces
 * all feature keys for the given layer's selection in one state update,
 * automatically assigning colour indexes.
 *
 * @param dispatch    - React dispatch function from the shared state reducer.
 * @param mapKey      - Key of the map that owns the layer.
 * @param layerKey    - Key of the rendering layer to add feature keys to.
 * @param featureKeys - Array of feature keys to set (should already be deduplicated).
 */
export function dispatchAddFeatureKeys(
	dispatch: Dispatch<any>,
	mapKey: string,
	layerKey: string,
	featureKeys: Array<string | number>
): void {
	dispatch({
		type: StateActionType.MAP_LAYER_SET_FEATURE_KEYS,
		payload: { mapKey, layerKey, featureKeys },
	} as ActionMapLayerSetFeatureKeys);
}
