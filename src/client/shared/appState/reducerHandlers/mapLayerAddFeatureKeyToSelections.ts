import { v4 as uuidv4 } from 'uuid';

import { AppSharedState } from '../state.models';
import { ActionMapLayerAddFeatureKey } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../selectors/getMapByKey';
import { SELECTION_DEFAULT_DISTINCT_COLOURS } from '../../constants/colors';

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

	let selectionKey: string | undefined = undefined;

	// Update rendering layers and determine selectionKey for the target layer
	const changedLayers: typeof mapToChange.renderingLayers = [];
	for (const layer of mapToChange.renderingLayers) {
		if (layer.key === layerKey) {
			if (!layer.selectionKey) {
				// If the layer doesn't have a selectionKey, generate a new one
				selectionKey = uuidv4();
				changedLayers.push({ ...layer, selectionKey });
			} else {
				// Use the existing selectionKey
				selectionKey = layer.selectionKey;
				changedLayers.push({ ...layer });
			}
		} else {
			changedLayers.push(layer);
		}
	}

	// Update the maps array with the changed layers for the target map
	const updatedMaps: SingleMapModel[] = state.maps.map((map) =>
		map.key === mapKey ? { ...map, renderingLayers: changedLayers } : map
	);

	// Prepare updated selections array
	const selections = Array.isArray(state.selections) ? [...state.selections] : [];
	let found = false;

	if (selectionKey) {
		for (let i = 0; i < selections.length; i++) {
			if (selections[i] && selections[i].key === selectionKey) {
				found = true;
				// Find the next available color index for the new featureKey
				const usedColorIndexes = Object.values(selections[i].featureKeyColourIndexPairs ?? {});
				let nextColorIndex = 0;
				while (usedColorIndexes.includes(nextColorIndex)) {
					nextColorIndex++;
				}
				// Add the featureKey and assign its color index
				selections[i] = {
					...selections[i],
					featureKeys: [...selections[i].featureKeys, featureKey],
					featureKeyColourIndexPairs: {
						...selections[i].featureKeyColourIndexPairs,
						[featureKey]: selections[i].distinctItems ? nextColorIndex : 0,
					},
				};
				break;
			}
		}
		if (!found) {
			// If no selection object exists for this key, create a new one
			selections.push({
				key: selectionKey,
				distinctColours: customSelectionStyle?.distinctColours ?? SELECTION_DEFAULT_DISTINCT_COLOURS,
				distinctItems: customSelectionStyle?.distinctItems ?? true,
				featureKeys: [featureKey],
				featureKeyColourIndexPairs: { [featureKey]: 0 },
			});
		}
	}

	// Return the updated state with new maps and selections
	return { ...state, maps: updatedMaps, selections };
};
