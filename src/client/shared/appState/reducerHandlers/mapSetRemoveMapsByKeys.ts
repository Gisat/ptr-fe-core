import { AppSharedState } from '../../appState/state.models';
import { ActionMapSetRemoveMapsByKeys } from '../../appState/state.models.actions';
import { getMapSetByKey } from '../selectors/getMapSetByKey';
import { MapSetModel } from '../../models/models.mapSet';

// TODO add tests for this reducer handler
/**
 * Handler for remove maps from map set by keys
 * @param state AppSharedState
 * @param action ActionMapSetRemoveMapsByKeys
 * @returns Updated AppSharedState
 */
export const reduceHandlerRemoveMapSetMapsByKeys = (
	state: AppSharedState,
	action: ActionMapSetRemoveMapsByKeys
): AppSharedState => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for remove maps from map set by keys action');
	const { mapSetKey, mapKeys } = payload;

	// Find the map set by key
	const mapSet = getMapSetByKey(state, mapSetKey);
	if (!mapSet) throw new Error(`MapSet with key ${mapSetKey} not found`);

	// Remove the maps from the map set
	const updatedMapSets = state.mapSets.map((mapSetItem: MapSetModel) => {
		if (mapSetItem.key === mapSetKey) {
			// Filter out the maps that match the keys to be removed
			const updatedMaps = mapSetItem.maps.filter((mapKey) => !mapKeys.includes(mapKey));
			return { ...mapSetItem, maps: updatedMaps };
		}
		return mapSetItem;
	});

	// Update the maps state by removing the maps that match the keys to be removed
	const updatedMaps = state.maps.filter((map) => !mapKeys.includes(map.key));

	// Return the updated state
	return { ...state, mapSets: updatedMapSets, maps: updatedMaps };
};
