import { AppSharedState } from '../state.models';
import { ActionMapLayerSetActiveFeatureKey } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../../appState/selectors/getMapByKey';

/**
 * Reducer to set the activeFeatureKey for a vector layer in a map's rendering layers.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerSetActiveFeatureKey} action - The action containing mapKey, layerKey, and activeFeatureKey.
 * @returns {AppSharedState} - The updated application state with the activeFeatureKey set for the specified layer.
 * @throws {Error} If the payload is missing or the map/layer is not found.
 */
export const reduceHandlerMapLayerSetActiveFeatureKey = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerSetActiveFeatureKey
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for setting activeFeatureKey');
	const { mapKey, layerKey, activeFeatureKey } = payload;

	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	const changedLayers = mapToChange.renderingLayers.map((layer) => {
		if (layer.key === layerKey) {
			return { ...layer, activeFeatureKey };
		}
		return layer;
	});

	const updatedMaps: SingleMapModel[] = state.maps.map((map: SingleMapModel) => {
		if (map.key === mapKey) {
			return { ...map, renderingLayers: changedLayers };
		}
		return map;
	});

	return { ...state, maps: updatedMaps };
};
