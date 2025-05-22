import { AppSharedState } from '../../appState/state.models';
import { MapSetModel } from '../../models/models.mapSet';

/**
 * Get map set state by map set key
 * @param state AppSharedState
 * @param key map set identifier
 * @returns {MapSet | undefined} map set state
 */
export const getMapSetByKey = (state: AppSharedState, key: string): MapSetModel | undefined => {
	return state?.mapSets?.find((mapSet) => mapSet.key === key);
};
