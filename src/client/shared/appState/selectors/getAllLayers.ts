import { AppSharedState } from '../../appState/state.models';
import { PantherEntity } from '../../../../globals/shared/panther/models.nodes';

/**
 * Selector to get all layers from the shared application state.
 * @param state
 */
export const getAllLayers = (state: AppSharedState): PantherEntity[] => {
	return state?.layers || [];
};
