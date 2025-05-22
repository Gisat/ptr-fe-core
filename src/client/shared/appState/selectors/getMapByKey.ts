import { AppSharedState } from '../../appState/state.models';
import { SingleMapModel } from '../../models/models.singleMap';

/**
 * Get map state by map key
 * @param state AppSharedState
 * @param key map identifier
 * @returns {SingleMap | undefined} map state
 */
export const getMapByKey = (state: AppSharedState, key: string): SingleMapModel | undefined => {
	return state?.maps?.find((map) => map.key === key);
};
