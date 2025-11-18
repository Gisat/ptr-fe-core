import { AppSharedState } from '../../appState/state.models';
import { PlaceWithNeighbours } from '../../models/models.metadata';

/**
 * Selector to get place by its key from the shared application state.
 * @param state
 * @param key - The key of the place to retrieve.
 */
export const getPlaceByKey = (state: AppSharedState, key: string): PlaceWithNeighbours | undefined => {
	return state?.places?.find((place) => place.key === key);
};
