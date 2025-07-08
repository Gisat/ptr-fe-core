import { AppSharedState } from '../state.models';
import { ActionMapLayerRemove } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../../appState/selectors/getMapByKey';

/**
 * Reducer handler to remove a layer from a map's rendering layers.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerRemove} action - The action containing the payload with mapKey and layerKey.
 * @returns {AppSharedState} The updated application state with the specified layer removed from the map.
 * @throws {Error} If the payload is missing or the map with the specified key is not found.
 */
export const reduceHandlerMapLayerRemove = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerRemove
): T => {
	const { payload } = action;

	// Ensure the payload is provided
	if (!payload) throw new Error('No payload provided for map layer remove action');
	const { mapKey, layerKey } = payload;

	// Find the map by its key
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	const filteredLayers = mapToChange.renderingLayers.filter((layerToChange) => layerToChange.key !== layerKey);

	// Update the maps array with the modified map
	const updatedMaps: SingleMapModel[] = state.maps.map((map: SingleMapModel) => {
		if (map.key === mapKey) {
			// Update the map that matches the key
			return { ...map, renderingLayers: filteredLayers };
		} else {
			// Return unchanged maps
			return map;
		}
	});

	// Return the updated application state
	return { ...state, maps: updatedMaps };
};
