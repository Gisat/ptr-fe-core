import { AppSharedState } from '../state.models';
import { OneOfStateActions } from '../state.models.actions';
import { StateActionType } from '../enum.state.actionType';
import { MapSetModel } from '../../models/models.mapSet';

/**
 * Reducer handler to add a new mapSet to the state dynamically.
 *
 * @param {AppSharedState} state - The current application shared state.
 * @param {OneOfStateActions} action - The dispatched action, expects payload to be a MapSetModel.
 * @returns {AppSharedState} The new state with the added mapSet.
 * @throws {Error} If payload is not provided.
 */
export function reduceHandlerMapSetAddMapSet(state: AppSharedState, action: OneOfStateActions): AppSharedState {
	if (action.type === StateActionType.MAP_SET_ADD) {
		if (!action.payload) {
			throw new Error('No payload provided for map set add action');
		}
		const newMapSet: MapSetModel = action.payload;
		// Prevent duplicates by key
		if (state.mapSets.some((ms) => ms.key === newMapSet.key)) {
			return state;
		}
		return {
			...state,
			mapSets: [...state.mapSets, newMapSet],
		};
	}
	return state;
}
