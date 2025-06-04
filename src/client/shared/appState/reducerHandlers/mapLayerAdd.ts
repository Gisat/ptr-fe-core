import { AppSharedState } from '../state.models';
import { ActionMapLayerAdd } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../../appState/selectors/getMapByKey';

/**
 * Handles the addition of a new layer to a map's rendering layers.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerAdd} action - The action containing the payload for adding a map layer.
 * @returns {AppSharedState} - The updated application state with the new layer added to the specified map.
 *
 * @throws {Error} If the payload is missing or the map with the specified key is not found.
 */
export const reduceHandlerMapLayerAdd = (state: AppSharedState, action: ActionMapLayerAdd): AppSharedState => {
	const { payload } = action;

	// Ensure the payload is provided
	if (!payload) throw new Error('No payload provided for map layer add action');
	const { mapKey, layer, index } = payload;

	// Find the map by its key
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	// Create a copy of the rendering layers to modify
	const changedLayers = [...mapToChange.renderingLayers];
	if (typeof index === 'number' && index >= 0) {
		// Insert the new layer at the specified index or replace the existing layer
		if (index < changedLayers.length) {
			changedLayers[index] = layer; // Replace the layer at the index
		} else {
			changedLayers.push(layer); // Add the layer at the end if index is out of bounds
		}
	} else {
		// Add the new layer to the end of the layers array
		changedLayers.push(layer);
	}

	// Update the maps array with the modified map
	const updatedMaps: SingleMapModel[] = state.maps.map((map: SingleMapModel) => {
		if (map.key === mapKey) {
			// Update the map that matches the key
			return { ...map, renderingLayers: changedLayers };
		} else {
			// Return unchanged maps
			return map;
		}
	});

	// Return the updated application state
	return { ...state, maps: updatedMaps };
};
