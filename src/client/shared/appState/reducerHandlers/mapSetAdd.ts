import { AppSharedState } from '../state.models';
import { OneOfStateActions } from '../state.models.actions';
import { StateActionType } from '../enum.state.actionType';
import { MapSetModel } from '../../models/models.mapSet';

/**
 * Reducer handler to add a new mapSet to the state dynamically.
 * Expects action.payload to be a MapSetModel.
 */
export function reduceHandlerMapSetAddMapSet(state: AppSharedState, action: OneOfStateActions): AppSharedState {
	if (action.type === StateActionType.MAP_SET_ADD && action.payload) {
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
