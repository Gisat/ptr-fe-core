import { AppSharedState } from '../state.models';
import { ActionMapLayerSetFeatureKey } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../selectors/getMapByKey';
import { updateRenderingLayers, updateSelections } from '../../helpers/selections';

/**
 * Reducer to set the featureKey for a vector layer in a map's rendering layers.
 * Ensures that in state.selections there is an object with the same key as the renderingLayer (selectionKey).
 * If not, it creates it or updates the featureKeys array.
 */
export const reduceHandlerSetFeatureKeyInSelections = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerSetFeatureKey
): T => {
	const { payload } = action;
	if (!payload) throw new Error('No payload provided for setting featureKey');
	const { mapKey, layerKey, featureKey, customSelectionStyle } = payload;

	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	// Use helper to update rendering layers and get selectionKey
	const { changedLayers, selectionKey } = updateRenderingLayers(mapToChange.renderingLayers, layerKey);

	// Update the maps array with the changed layers for the target map
	const updatedMaps: SingleMapModel[] = state.maps.map((map) =>
		map.key === mapKey ? { ...map, renderingLayers: changedLayers } : map
	);

	// Use helper to update selections array, but always set only the single featureKey
	const selections = Array.isArray(state.selections) ? state.selections : [];
	const updatedSelections = updateSelections(
		selections,
		selectionKey,
		featureKey,
		customSelectionStyle,
		true // Pass overwrite flag for "set" behavior
	);

	return { ...state, maps: updatedMaps, selections: updatedSelections };
};
