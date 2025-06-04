import { AppSharedState } from '../../appState/state.models';
import { ActionMapSetSyncChange } from '../../appState/state.models.actions';
import { getMapSetByKey } from '../selectors/getMapSetByKey';
import { MapSetModel } from '../../models/models.mapSet';

/**
 * Handler for map set sync change action
 * @param state AppSharedState
 * @param action ActionMapSetSyncChange
 * @returns Updated AppSharedState
 */
export const reduceHandlerMapSetSyncChange = <T extends AppSharedState>(
	state: T,
	action: ActionMapSetSyncChange
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for map set sync change action');
	const { key: mapSetKey, syncChange } = payload;

	// Find the map set by key
	const mapSet = getMapSetByKey(state, mapSetKey);
	if (!mapSet) throw new Error(`MapSet with key ${mapSetKey} not found`);

	// Update map set sync
	const updatedMapSets: MapSetModel[] = state.mapSets.map((mapSet: MapSetModel) =>
		mapSet.key === mapSetKey ? { ...mapSet, sync: { ...mapSet.sync, ...syncChange } } : mapSet
	);

	// Return the updated state
	return { ...state, mapSets: updatedMapSets };
};
