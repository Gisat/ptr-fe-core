import { AppSharedState } from '../state.models';
import { ActionGlobalStateUpdate } from '../state.models.actions';
import { deduplicateByKey } from '../../../../globals/shared/coding/deduplicateByKey';

/**
 * Temporarily used to update the global state of the application.
 * @param state AppSharedState
 * @param action ActionGlobalStateUpdate
 * @returns Updated AppSharedState
 */
export const reduceHandlerGlobalStateUpdate = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionGlobalStateUpdate
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided global state update');
	const { maps, mapSets, renderingLayers, ...otherState } = payload;

	// Return the updated state
	return {
		...state,
		mapSets: mapSets ? deduplicateByKey([...state.mapSets, ...mapSets]) : state.mapSets,
		maps: maps ? deduplicateByKey([...state.maps, ...maps]) : state.maps,
		renderingLayers: renderingLayers
			? deduplicateByKey([...state.renderingLayers, ...renderingLayers])
			: state.renderingLayers,
		...otherState,
	};
};
