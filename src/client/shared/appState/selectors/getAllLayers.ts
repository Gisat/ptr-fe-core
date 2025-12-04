import { AppSharedState } from '../../appState/state.models';
import { PantherEntityWithNeighbours } from '../../models/models.metadata';

/**
 * Selector to get all layers from the shared application state.
 * @param state
 */
export const getAllLayers = (state: AppSharedState): PantherEntityWithNeighbours[] => {
	return state?.layers || [];
};
