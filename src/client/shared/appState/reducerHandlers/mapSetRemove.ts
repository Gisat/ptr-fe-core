import { AppSharedState } from '../state.models';
import { OneOfStateActions } from '../state.models.actions';
import { StateActionType } from '../enum.state.actionType';

/**
 * Reducer handler to remove a mapSet by key.
 * Expects action.payload to be { key: string }.
 */
export function reduceHandlerMapSetRemove(
    state: AppSharedState,
    action: OneOfStateActions
): AppSharedState {
    if (
        action.type === StateActionType.MAP_SET_REMOVE &&
        action.payload &&
        action.payload.mapSetKey
    ) {
        return {
            ...state,
            mapSets: state.mapSets.filter(ms => ms.key !== action.payload.mapSetKey),
        };
    }
    return state;
}