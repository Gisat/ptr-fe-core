/**
 * Tests for removing a feature key from layer selections.
 * Verifies:
 *  - Error when payload missing
 *  - Error when map not found
 *  - Proper removal of featureKey from selection (featureKeys + colourIndex pairs)
 *  - No change when layer has no selectionKey
 *  - Graceful handling when selections is not an array
 *  - Immutability of selections array and modified selection object
 */
import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveFeatureKeyInSelections } from '../../../../client/shared/appState/reducerHandlers/mapLayerRemoveFeatureKeyInSelections';
import { createBaseState } from '../../../../client/shared/appState/tests/state.fixture';

const mockGetMapByKey = vi.fn();

vi.mock('../selectors/getMapByKey', () => ({
	getMapByKey: (...args: any[]) => mockGetMapByKey(...args),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

/**
 * Main suite
 */
describe('removing a feature key from layer selections', () => {
	/**
	 * Throws when payload missing
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState();
		expect(() =>
			reduceHandlerRemoveFeatureKeyInSelections(state, {
				type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for removing featureKey');
	});

	/**
	 * Throws when map not found
	 */
	it('throws when map not found', () => {
		const state = createBaseState();
		mockGetMapByKey.mockReturnValue(undefined);

		expect(() =>
			reduceHandlerRemoveFeatureKeyInSelections(state, {
				type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
				payload: { mapKey: 'unknown', layerKey: 'layerA', featureKey: 'f2' },
			} as any)
		).toThrow('Map with key unknown not found');

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'unknown');
	});

	/**
	 * Removes featureKey from selection (featureKeys & featureKeyColourIndexPairs) immutably
	 */
	it('removes featureKey from matching selection', () => {
		const state = createBaseState();
		// Add selectionKey to target layer
		state.maps[0].renderingLayers[0] = {
			...state.maps[0].renderingLayers[0],
			selectionKey: 'sel-layerA',
		};
		// Populate selections
		state.selections = [
			{
				key: 'sel-layerA',
				featureKeys: ['f1', 'f2', 'f3'],
				featureKeyColourIndexPairs: { f1: 0, f2: 1, f3: 2 },
			} as any,
			{
				key: 'other-selection',
				featureKeys: ['x'],
				featureKeyColourIndexPairs: { x: 5 },
			} as any,
		];

		mockGetMapByKey.mockImplementation((_s, k) => _s.maps.find((m: any) => m.key === k));

		const originalSelections = state.selections;
		const originalFirstSelection = state.selections[0];

		const action = {
			type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
			payload: { mapKey: 'map1', layerKey: 'layerA', featureKey: 'f2' },
		} as any;

		const newState = reduceHandlerRemoveFeatureKeyInSelections(state, action);

		// New selections array
		expect(newState.selections).not.toBe(originalSelections);
		// First selection object replaced
		expect(newState.selections[0]).not.toBe(originalFirstSelection);

		// f2 removed from featureKeys
		expect(newState.selections[0].featureKeys).toEqual(['f1', 'f3']);
		// f2 removed from colour pairs; others intact
		expect(newState.selections[0].featureKeyColourIndexPairs).toEqual({ f1: 0, f3: 2 });

		// Other selection untouched (same reference)
		expect(newState.selections[1]).toBe(state.selections[1]);

		// Maps reference unchanged
		expect(newState.maps).toBe(state.maps);

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'map1');
	});

	/**
	 * Does nothing (content-wise) when layer has no selectionKey
	 * (array is still recreated, element references preserved)
	 */
	it('does nothing when layer lacks selectionKey', () => {
		const state = createBaseState();
		state.selections = [
			{
				key: 'sel-layerA',
				featureKeys: ['f1', 'f2'],
				featureKeyColourIndexPairs: { f1: 0, f2: 1 },
			} as any,
		];
		// layerA has no selectionKey
		mockGetMapByKey.mockImplementation((_s, k) => _s.maps.find((m: any) => m.key === k));

		const originalSelections = state.selections;
		const originalSelectionObj = state.selections[0];

		const newState = reduceHandlerRemoveFeatureKeyInSelections(state, {
			type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
			payload: { mapKey: 'map1', layerKey: 'layerA', featureKey: 'f2' },
		} as any);

		// Array recreated
		expect(newState.selections).not.toBe(originalSelections);
		// Object reference unchanged
		expect(newState.selections[0]).toBe(originalSelectionObj);
		// Data unchanged
		expect(newState.selections[0].featureKeys).toEqual(['f1', 'f2']);
		expect(newState.selections[0].featureKeyColourIndexPairs).toEqual({ f1: 0, f2: 1 });
	});

	/**
	 * Normalizes non-array selections to empty array
	 */
	it('normalizes non-array selections to empty array', () => {
		const state: any = createBaseState();
		state.selections = null;
		state.maps[0].renderingLayers[0] = {
			...state.maps[0].renderingLayers[0],
			selectionKey: 'sel-layerA',
		};
		mockGetMapByKey.mockImplementation((_s, k) => _s.maps.find((m: any) => m.key === k));

		const newState = reduceHandlerRemoveFeatureKeyInSelections(state, {
			type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
			payload: { mapKey: 'map1', layerKey: 'layerA', featureKey: 'f1' },
		} as any);

		expect(Array.isArray(newState.selections)).toBe(true);
		expect(newState.selections.length).toBe(0);
	});
});
