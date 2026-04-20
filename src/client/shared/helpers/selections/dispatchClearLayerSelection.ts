import { Dispatch } from 'react';
import { ActionMapLayerClearSelection } from '../../appState/state.models.actions';
import { StateActionType } from '../../appState/enum.state.actionType';

/**
 * Dispatches MAP_LAYER_CLEAR_SELECTION — a single atomic action that wipes
 * all feature keys and colour index pairs for the given layer's selection in one state update.
 *
 * @param dispatch - React dispatch function from the shared state reducer.
 * @param mapKey   - Key of the map that owns the layer.
 * @param layerKey - Key of the rendering layer whose selection should be cleared.
 */
export function dispatchClearLayerSelection(
	dispatch: Dispatch<any>,
	mapKey: string,
	layerKey: string
): void {
	dispatch({
		type: StateActionType.MAP_LAYER_CLEAR_SELECTION,
		payload: { mapKey, layerKey },
	} as ActionMapLayerClearSelection);
}
