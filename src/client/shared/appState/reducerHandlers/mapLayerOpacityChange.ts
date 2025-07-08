import { AppSharedState } from '../state.models';
import { ActionMapLayerOpacityChange } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../selectors/getMapByKey';

/**
 * Handler for map layer opacity change action
 * @param state AppSharedState
 * @param action ActionMapLayerOpacityChange
 * @returns Updated AppSharedState
 */
export const reduceHandlerMapLayerOpacityChange = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerOpacityChange
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for map layer opacity change action');
	const { mapKey, layerKey, opacity } = payload;

	// Find the map
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	// Get updated layers
	const changedLayers = mapToChange.renderingLayers.map((layer) => {
		if (layer.key === layerKey) {
			// Update layer opacity
			return { ...layer, opacity };
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
