import { AppSharedState } from '../../appState/state.models';
import { ActionMapRemoveFromMapSet } from '../../appState/state.models.actions';
import { getMapSetByKey } from '../selectors/getMapSetByKey';
import { MapSetModel } from '../../models/models.mapSet';

// TODO add tests for this reducer handler
/**
 * Handler for remove map from map set action
 * @param state AppSharedState
 * @param action ActionMapRemoveFromMapSet
 * @returns Updated AppSharedState
 */
export const reduceHandlerMapSetRemoveMap = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapRemoveFromMapSet
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for map remove from map set action');
	const { mapSetKey, mapKey } = payload;

	// Find the map set by key
	const mapSet = getMapSetByKey(state, mapSetKey);
	if (!mapSet) throw new Error(`MapSet with key ${mapSetKey} not found`);

	// Remove the map from the map set maps
	const updatedMapSets: MapSetModel[] = state.mapSets.map((mapSet: MapSetModel) =>
		mapSet.key === mapSetKey ? { ...mapSet, maps: mapSet.maps.filter((map) => map !== mapKey) } : mapSet
	);

	// Remove the map from the maps array
	const updatedMaps = state.maps.filter((map) => map.key !== mapKey);

	// Return the updated state
	return { ...state, mapSets: updatedMapSets, maps: updatedMaps };
};
