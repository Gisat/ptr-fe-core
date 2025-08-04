import { AppSharedState } from '../state.models';
import { ActionMapLayerAddFeatureKey } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../selectors/getMapByKey';
import { updateRenderingLayers, updateSelections } from '../../helpers/reducerHandlers/selections';

/**
 * Reducer to add a featureKey to the selection for a vector layer in a map's rendering layers.
 * Ensures that in state.selections there is an object with the same key as the renderingLayer (selectionKey).
 * If not, it creates it. Assigns the lowest unused color index to the new featureKey.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerAddFeatureKey} action - The action containing mapKey, layerKey, featureKey, and optional customSelectionStyle.
 * @returns {AppSharedState} - The updated application state with the featureKey added to the selection.
 * @throws {Error} If the payload is missing or the map/layer is not found.
 */
export const reduceHandlerAddFeatureKeyToSelections = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerAddFeatureKey
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for adding featureKey');
	const { mapKey, layerKey, featureKey, customSelectionStyle } = payload;

	// Find the map to update
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	// Use helper to update rendering layers and get selectionKey
	const { changedLayers, selectionKey } = updateRenderingLayers(mapToChange.renderingLayers, layerKey);

	// Update the maps array with the changed layers for the target map
	const updatedMaps: SingleMapModel[] = state.maps.map((map) =>
		map.key === mapKey ? { ...map, renderingLayers: changedLayers } : map
	);

	// Use helper to update selections array
	const selections = Array.isArray(state.selections) ? state.selections : [];
	const updatedSelections = updateSelections(selections, selectionKey, featureKey, customSelectionStyle);

	// Return the updated state with new maps and selections
	return { ...state, maps: updatedMaps, selections: updatedSelections };
};
