import { AppSharedState } from '../state.models';
import { ActionGlobalStateUpdate } from '../state.models.actions';

/**
 * Temporarily used to update the global state of the application.
 * @param state AppSharedState
 * @param action ActionGlobalStateUpdate
 * @returns Updated AppSharedState
 */
export const reduceHandlerGlobalStateUpdate = (
	state: AppSharedState,
	action: ActionGlobalStateUpdate
): AppSharedState => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided global state update');
	const { maps, mapSets, renderingLayers } = payload;

	// Return the updated state
	return {
		...state,
		mapSets: mapSets ? [...state.mapSets, ...mapSets] : state.mapSets,
		maps: maps ? [...state.maps, ...maps] : state.maps,
		renderingLayers: renderingLayers ? [...state.renderingLayers, ...renderingLayers] : state.renderingLayers,
	};
};
