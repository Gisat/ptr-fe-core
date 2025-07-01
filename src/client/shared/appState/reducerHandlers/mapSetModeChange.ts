import { AppSharedState } from '../../appState/state.models';
import { ActionMapSetModeChange } from '../../appState/state.models.actions';
import { getMapSetByKey } from '../selectors/getMapSetByKey';
import { MapSetModel } from '../../models/models.mapSet';

/**
 * Handles the action to change the mode of a map set in the shared application state.
 * Updates the mode of the specified map set and returns the updated state.
 *
 * @param {AppSharedState} state - The current shared application state.
 * @param {ActionMapSetModeChange} action - The action containing the payload with the map set key and new mode.
 * @returns {AppSharedState} The updated application state with the modified map set mode.
 * @throws {Error} If the payload is missing or the map set with the specified key is not found.
 */
export const reduceHandlerMapSetModeChange = <T extends AppSharedState>(
	state: T,
	action: ActionMapSetModeChange
): T => {
	const { payload } = action;

	// Ensure the payload is provided
	if (!payload) throw new Error('No payload provided for map set mode change action');
	const { key: mapSetKey, mode } = payload;

	// Find the map set by key
	const mapSet = getMapSetByKey(state, mapSetKey);
	if (!mapSet) throw new Error(`MapSet with key ${mapSetKey} not found`);

	// Update the mode of the map set
	const updatedMapSets: MapSetModel[] = state.mapSets.map((mapSet: MapSetModel) =>
		mapSet.key === mapSetKey ? { ...mapSet, mode } : mapSet
	);

	// Return the updated state
	return { ...state, mapSets: updatedMapSets };
};
