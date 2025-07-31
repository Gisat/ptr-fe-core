import { v4 as uuidv4 } from 'uuid';

import { AppSharedState } from '../state.models';
import { ActionMapLayerSetFeatureKey } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../selectors/getMapByKey';
import { SELECTION_DEFAULT_DISTINCT_COLOURS } from '../../constants/colors';

/**
 * Reducer to set the featureKey for a vector layer in a map's rendering layers.
 * Ensures that in state.selections there is an object with the same key as the renderingLayer (selectionKey).
 * If not, it creates it or updates the featureKeys array.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerSetFeatureKey} action - The action containing mapKey, layerKey, and featureKey.
 * @returns {AppSharedState} - The updated application state with the featureKey set for the specified layer.
 * @throws {Error} If the payload is missing or the map/layer is not found.
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

	let selectionKey: string | undefined = undefined;

	// Update rendering layers and determine selectionKey
	const changedLayers: typeof mapToChange.renderingLayers = [];
	for (const layer of mapToChange.renderingLayers) {
		if (layer.key === layerKey) {
			if (!layer.selectionKey) {
				selectionKey = uuidv4();
				changedLayers.push({ ...layer, selectionKey });
			} else {
				selectionKey = layer.selectionKey;
				changedLayers.push({ ...layer });
			}
		} else {
			changedLayers.push(layer);
		}
	}

	// Update maps with changed layers
	const updatedMaps: SingleMapModel[] = state.maps.map((map) =>
		map.key === mapKey ? { ...map, renderingLayers: changedLayers } : map
	);

	// Prepare updated selections
	const selections = Array.isArray(state.selections) ? [...state.selections] : [];
	let found = false;

	if (selectionKey) {
		for (let i = 0; i < selections.length; i++) {
			if (selections[i] && selections[i].key === selectionKey) {
				found = true;
				// Always overwrite featureKeys with a single featureKey and reset colour index
				selections[i] = {
					...selections[i],
					featureKeys: [featureKey],
					featureKeyColourIndexPairs: { [featureKey]: 0 },
				};
				break;
			}
		}
		if (!found) {
			// Create new selection object if not found
			selections.push({
				key: selectionKey,
				distinctColours: customSelectionStyle?.distinctColours ?? SELECTION_DEFAULT_DISTINCT_COLOURS,
				distinctItems: customSelectionStyle?.distinctItems ?? true,
				featureKeys: [featureKey],
				featureKeyColourIndexPairs: { [featureKey]: 0 },
			});
		}
	}

	return { ...state, maps: updatedMaps, selections };
};
