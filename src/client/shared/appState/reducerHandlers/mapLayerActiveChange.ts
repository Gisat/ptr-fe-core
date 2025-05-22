import { AppSharedState } from '../state.models';
import { ActionMapLayerActiveChange } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../../appState/selectors/getMapByKey';

/**
 * Handler for map layer visibility change action
 * @param state AppSharedState
 * @param action ActionMapLayerActiveChange
 * @returns Updated AppSharedState
 */
export const reduceHandlerMapLayerActiveChange = (
	state: AppSharedState,
	action: ActionMapLayerActiveChange
): AppSharedState => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for map layer visibility change action');
	const { mapKey, layerKey, isActive } = payload;

	// Find the map
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	// Get updated layers
	const changedLayers = mapToChange.renderingLayers.map((layer) => {
		if (layer.key === layerKey) {
			// Update layer visibility
			return { ...layer, isActive };
		} else {
			// Return unchanged layer
			return layer;
		}
	});

	const updatedMaps: SingleMapModel[] = state.maps.map((map: SingleMapModel) => {
		if (map.key === mapKey) {
			// Update the map that triggered the change
			return { ...map, renderingLayers: changedLayers };
		} else {
			// Return unchanged map
			return map;
		}
	});

	// Return the updated state
	return { ...state, maps: updatedMaps };
};
