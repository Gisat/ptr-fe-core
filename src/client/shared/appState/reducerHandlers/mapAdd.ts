import { AppSharedState } from '../state.models';
import { OneOfStateActions } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';

/**
 * Handles the addition of a new map to the application state.
 *
 * @template T - The type of the application state, extending `AppSharedState`.
 * @param {T} state - The current application state.
 * @param {OneOfStateActions} action - The action containing the payload with the new map to be added.
 * @returns {T} - The updated application state with the new map added, or the original state if the map already exists.
 */
export const reduceHandlerMapAdd = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: OneOfStateActions
): T => {
	// Extract the new map from the action payload
	const newMap: SingleMapModel = action.payload;

	// Prevent adding duplicate maps by checking if a map with the same key already exists
	if (state.mapSets.some((ms) => ms.key === newMap.key)) {
		return state; // Return the original state if a duplicate is found
	}

	// Return the updated state with the new map added to the `maps` array
	return {
		...state,
		maps: [...state.maps, newMap],
	};
};
