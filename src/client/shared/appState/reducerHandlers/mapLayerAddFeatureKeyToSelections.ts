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
 * @param {ActionMapLayerAddFeatureKey} action - The action containing mapKey, layerKey, and featureKey.
 * @returns {AppSharedState} - The updated application state with the featureKey added to the selection.
 * @throws {Error} If the payload is missing or the map/layer is not found.
 */
export const reduceHandlerAddFeatureKeyToSelections = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerAddFeatureKey
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for adding featureKey');
	const { mapKey, layerKey, featureKey } = payload;

	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	let selectionKey: string | undefined = undefined;

	const changedLayers = mapToChange.renderingLayers.map((layer) => {
		const layerSelectionKey = layer.selectionKey;
		if (layer.key === layerKey && !layerSelectionKey) {
			selectionKey = uuidv4();
			return { ...layer, selectionKey };
		} else if (layer.key === layerKey) {
			selectionKey = layerSelectionKey;
			return { ...layer };
		}
		return layer;
	});

	const updatedMaps: SingleMapModel[] = state.maps.map((map) => {
		if (map.key === mapKey) {
			return { ...map, renderingLayers: changedLayers };
		}
		return map;
	});

	const selections = state.selections;
	let updatedSelections = [...selections];

	if (selectionKey) {
		const selection = selections.find((sel) => sel && sel.key === selectionKey);
		if (!selection) {
			// Create new selection object if not found
			updatedSelections.push({
				key: selectionKey,
				distinctColours: SELECTION_DEFAULT_DISTINCT_COLOURS,
				featureKeys: [featureKey],
				featureKeyColourIndexPairs: { [featureKey]: 0 },
			});
		} else {
			// Add featureKey with the lowest unused color index
			updatedSelections = selections.map((selection) => {
				const layerSelectionKey = selection.key;
				if (layerSelectionKey === selectionKey) {
					const usedColorIndexes = Object.values(selection.featureKeyColourIndexPairs);
					let nextColorIndex = 0;
					while (usedColorIndexes.includes(nextColorIndex)) {
						nextColorIndex++;
					}
					return {
						...selection,
						featureKeys: [...selection.featureKeys, featureKey],
						featureKeyColourIndexPairs: { ...selection.featureKeyColourIndexPairs, [featureKey]: nextColorIndex },
					};
				} else {
					return { ...selection };
				}
			});
		}
	}

	return { ...state, maps: updatedMaps, selections: updatedSelections };
};
