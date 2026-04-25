import { AppSharedState } from '../state.models';
import { ActionMapLayerSetBulkSelection } from '../state.models.actions';

/**
 * Reducer handler for MAP_LAYER_SET_BULK_SELECTION.
 *
 * Atomically writes a named selection entry into state.selections.
 * Unlike MAP_LAYER_SET_FEATURE_KEYS, this handler works by selectionKey directly
 * (no mapKey/layerKey lookup required) and gives the caller explicit control over
 * whether features share one colour or each receive a distinct cycling colour index.
 *
 * @param state   - Current application state.
 * @param action  - Action with selectionKey, featureKeys, distinctColours, and optional distinctItems.
 * @returns Updated state with the selection entry created or replaced.
 */
export const reduceHandlerSetBulkSelection = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapLayerSetBulkSelection,
): T => {
	const { selectionKey, featureKeys, distinctColours, distinctItems = false } = action.payload;

	const featureKeyColourIndexPairs = distinctItems
		? Object.fromEntries(featureKeys.map((key, index) => [String(key), index % distinctColours.length]))
		: Object.fromEntries(featureKeys.map((key) => [String(key), 0]));

	const newSelection = {
		key: selectionKey,
		distinctItems,
		distinctColours,
		featureKeys,
		featureKeyColourIndexPairs,
	};

	const existingSelections = Array.isArray(state.selections) ? state.selections : [];
	const updatedSelections = existingSelections.some((selection) => selection.key === selectionKey)
		? existingSelections.map((selection) => (selection.key === selectionKey ? newSelection : selection))
		: [...existingSelections, newSelection];

	return { ...state, selections: updatedSelections };
};

