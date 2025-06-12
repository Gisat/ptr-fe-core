import { AppSharedState } from '../../appState/state.models';
import { ActionMapAddToMapSet } from '../../appState/state.models.actions';
import { getMapSetByKey } from '../selectors/getMapSetByKey';
import { MapSetModel } from '../../models/models.mapSet';

// TODO add tests for this reducer handler
/**
 * Handler for map set sync change action
 * @param state AppSharedState
 * @param action ActionMapAddToMapSet
 * @returns Updated AppSharedState
 */
export const reduceHandlerMapSetAddMap = (state: AppSharedState, action: ActionMapAddToMapSet): AppSharedState => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for map add to map set action');
	const { mapSetKey, map } = payload;

	// Find the map set by key
	const mapSet = getMapSetByKey(state, mapSetKey);
	if (!mapSet) throw new Error(`MapSet with key ${mapSetKey} not found`);

	// Update map set maps with the new map
	const updatedMapSets: MapSetModel[] = state.mapSets.map((mapSet: MapSetModel) =>
		mapSet.key === mapSetKey ? { ...mapSet, maps: [...mapSet.maps, map.key] } : mapSet
	);

	// Add new map
	const updatedMaps = [...state.maps, map];

	// Return the updated state
	return { ...state, mapSets: updatedMapSets, maps: updatedMaps };
};
