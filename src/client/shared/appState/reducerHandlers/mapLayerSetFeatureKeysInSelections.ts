import { AppSharedState } from '../state.models';
import { ActionMapLayerSetFeatureKeys } from '../state.models.actions';
import { SingleMapModel } from '../../models/models.singleMap';
import { getMapByKey } from '../selectors/getMapByKey';
import { updateRenderingLayers } from '../../helpers/reducerHandlers/selections';
import { SELECTION_DEFAULT_DISTINCT_COLOURS } from '../../constants/colors';
import { Selection } from '../../models/models.selections';

/**
 * Reducer to atomically replace all feature keys for a map layer selection.
 *
 * Unlike dispatching MAP_LAYER_ADD_FEATURE_KEY N times (N state updates, N re-renders),
 * this replaces the entire featureKeys array and recalculates colour index pairs in one
 * single state update.
 *
 * @param {AppSharedState} state - The current application state.
 * @param {ActionMapLayerSetFeatureKeys} action - The action containing mapKey, layerKey, featureKeys, and optional customSelectionStyle.
 * @returns {AppSharedState} - Updated state with selection replaced atomically.
 */
export const reduceHandlerSetFeatureKeysInSelections = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerSetFeatureKeys
): T => {
	const { payload } = action;
	if (!payload) throw new Error('No payload provided for setting featureKeys');

	const { mapKey, layerKey, featureKeys, customSelectionStyle } = payload;

	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	const { changedLayers, selectionKey } = updateRenderingLayers(mapToChange.renderingLayers, layerKey);

	const updatedMaps: SingleMapModel[] = state.maps.map((map) =>
		map.key === mapKey ? { ...map, renderingLayers: changedLayers } : map
	);

	const colours = customSelectionStyle?.distinctColours ?? SELECTION_DEFAULT_DISTINCT_COLOURS;

	// Assign colour index for each feature key (round-robin across available colours)
	const featureKeyColourIndexPairs: Record<string | number, number> = Object.fromEntries(
		featureKeys.map((key, index) => [key, index % colours.length])
	);

	const existingSelections = Array.isArray(state.selections) ? state.selections : [];

	const newSelection: Selection = {
		key: selectionKey,
		distinctColours: colours,
		distinctItems: customSelectionStyle?.distinctItems ?? true,
		featureKeys: [...featureKeys],
		featureKeyColourIndexPairs,
	};

	// Replace existing selection with same key, or append if new
	const updatedSelections = existingSelections.some((selected) => selected.key === selectionKey)
		? existingSelections.map((selected) => (selected.key === selectionKey ? newSelection : selected))
		: [...existingSelections, newSelection];

	return { ...state, maps: updatedMaps, selections: updatedSelections };
};

