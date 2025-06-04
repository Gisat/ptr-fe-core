import { AppSharedState } from '../../appState/state.models';
import { getMapSetByKey } from './getMapSetByKey';

/**
 * Get map set by map key
 * @param state shared state
 * @param mapSetKey map identifier
 * @returns {string[]} list of maps in the map set
 */
export const getMapSetMaps = (state: AppSharedState, mapSetKey: string) => {
	return getMapSetByKey(state, mapSetKey)?.maps;
};
