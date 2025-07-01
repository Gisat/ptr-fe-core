import { AppSharedState } from '../state.models';
import { OneOfStateActions } from '../state.models.actions';
import { StateActionType } from '../enum.state.actionType';

/**
 * Reducer handler to remove a mapSet by key.
 *
 * @param {AppSharedState} state - The current application shared state.
 * @param {OneOfStateActions} action - The dispatched action, expects payload with mapSetKey.
 * @returns {AppSharedState} The new state with the specified mapSet removed.
 * @throws {Error} If payload or mapSetKey is not provided.
 */
export const reduceHandlerMapSetRemove = <T extends AppSharedState>(state: T, action: OneOfStateActions): T => {
	if (action.type === StateActionType.MAP_SET_REMOVE) {
		if (!action.payload || !action.payload.mapSetKey) {
			throw new Error('No payload or mapSetKey provided for map set remove action');
		}
		return {
			...state,
			mapSets: state.mapSets.filter((ms) => ms.key !== action.payload.mapSetKey),
		};
	}
	return state;
};
