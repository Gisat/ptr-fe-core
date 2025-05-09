import { AppSharedState } from '../../appState/state.models';

/**
 * Get map set by map key
 * @param state shared state
 * @param mapKey map identifier
 * @returns {MapSet | undefined} map set
 */
export const getMapSetByMapKey = (state: AppSharedState, mapKey: string) => {
	return state?.mapSets?.find((mapSet) => mapSet.maps.includes(mapKey));
};
