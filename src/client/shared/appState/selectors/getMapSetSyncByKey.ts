import { AppSharedState } from '../state.models';
import { MapSetSync } from '../../models/models.mapSetSync';

/**
 * Get map set sync state by map set key
 * @param state AppSharedState
 * @param key map set identifier
 * @returns {MapSetSync} map set sync state
 */
export const getMapSetSyncByKey = (state: AppSharedState, key: string): MapSetSync | undefined => {
	return state?.mapSets?.find((mapSet) => mapSet.key === key)?.sync;
};
