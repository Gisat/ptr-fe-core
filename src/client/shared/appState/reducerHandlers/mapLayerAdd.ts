import { AppSharedState } from '../state.models';
import { ActionMapLayerAdd } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../../appState/selectors/getMapByKey';

export const reduceHandlerMapLayerAdd = (state: AppSharedState, action: ActionMapLayerAdd): AppSharedState => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for map layer add action');
	const { mapKey, layer, index } = payload;

	// Find the map
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	const changedLayers = [...mapToChange.renderingLayers];
	if (index && index >= 0) {
		// Insert the new layer at the specified index (and replace if it exists)
		if (index < changedLayers.length) {
			// Replace existing layer at index if it exists
			changedLayers[index] = layer;
		} else {
			// Add the new layer at the end if index is out of bounds
			changedLayers.push(layer);
		}
	} else {
		// Add the new layer to the end of the layers array
		changedLayers.push(layer);
	}

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
