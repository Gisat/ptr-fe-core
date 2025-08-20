/**
 * Tests for setting (overwriting) a feature key in layer selections.
 * Verifies:
 *  - Error handling for missing payload
 *  - Error handling for unknown map
 *  - Proper update & overwrite behavior of selections (single feature kept)
 *  - Only targeted map is cloned; other maps keep reference
 *  - Rendering layers updated using helper (selectionKey propagation)
 *  - Normalization when selections is not an array
 *  - Overwrite flag (true) passed to updateSelections helper
 */
import { StateActionType } from '../enum.state.actionType';
import { createBaseState } from '../tests/state.fixture';
import { reduceHandlerSetFeatureKeyInSelections } from './mapLayerSetFeatureKeyInSelections';

const mockGetMapByKey = vi.fn();
const mockUpdateRenderingLayers = vi.fn();
const mockUpdateSelections = vi.fn();

vi.mock('../selectors/getMapByKey', () => ({
	getMapByKey: (...args: any[]) => mockGetMapByKey(...args),
}));

vi.mock('../../helpers/reducerHandlers/selections', () => ({
	updateRenderingLayers: (...args: any[]) => mockUpdateRenderingLayers(...args),
	updateSelections: (...args: any[]) => mockUpdateSelections(...args),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

/**
 * Main suite
 */
describe('setting a feature key for map layer selections', () => {
	/**
	 * Throws when payload missing
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState();
		expect(() =>
			reduceHandlerSetFeatureKeyInSelections(state, {
				type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for setting featureKey');
	});

	/**
	 * Throws when map not found
	 */
	it('throws when map not found', () => {
		const state = createBaseState();
		mockGetMapByKey.mockReturnValue(undefined);

		expect(() =>
			reduceHandlerSetFeatureKeyInSelections(state, {
				type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
				payload: { mapKey: 'unknown', layerKey: 'layerA', featureKey: 'feat1' },
			} as any)
		).toThrow('Map with key unknown not found');

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'unknown');
	});

	/**
	 * Updates maps & selections:
	 *  - Only target map cloned
	 *  - Selections overwritten (single feature enforced)
	 *  - Helpers invoked with correct args incl. overwrite flag
	 */
	it('overwrites selection for given layer featureKey', () => {
		const state = createBaseState();
		// existing selections array with prior multi-feature entry
		state.selections = [
			{
				key: 'sel-layerA',
				featureKeys: ['old1', 'old2'],
				featureKeyColourIndexPairs: { old1: 0, old2: 1 },
			} as any,
		];

		const originalMap1 = state.maps[0];
		const originalMap2 = state.maps[1];

		mockGetMapByKey.mockImplementation((_s, k) => _s.maps.find((m: any) => m.key === k));
		mockUpdateRenderingLayers.mockReturnValue({
			changedLayers: [{ key: 'layerA', isActive: true, selectionKey: 'sel-layerA' }],
			selectionKey: 'sel-layerA',
		});
		const updatedSelectionsResult = [
			{
				key: 'sel-layerA',
				featureKeys: ['newFeat'],
				featureKeyColourIndexPairs: { newFeat: 2 },
			},
		];
		mockUpdateSelections.mockReturnValue(updatedSelectionsResult);

		const action = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: {
				mapKey: 'map1',
				layerKey: 'layerA',
				featureKey: 'newFeat',
				customSelectionStyle: { stroke: '#123456' },
			},
		} as any;

		const newState = reduceHandlerSetFeatureKeyInSelections(state, action);

		// State immutability
		expect(newState).not.toBe(state);
		expect(newState.maps).not.toBe(state.maps);
		expect(newState.selections).toBe(updatedSelectionsResult);

		// Only target map cloned
		const updatedMap1 = newState.maps.find((m: any) => m.key === 'map1');
		const updatedMap2 = newState.maps.find((m: any) => m.key === 'map2');
		expect(updatedMap1).not.toBe(originalMap1);
		expect(updatedMap2).toBe(originalMap2);

		// Rendering layers updated
		expect(updatedMap1?.renderingLayers).toEqual([{ key: 'layerA', isActive: true, selectionKey: 'sel-layerA' }]);

		// Helpers called with expected arguments
		expect(mockUpdateRenderingLayers).toHaveBeenCalledWith(originalMap1.renderingLayers, 'layerA');
		// Fifth argument (overwrite flag) should be true
		expect(mockUpdateSelections).toHaveBeenCalledWith(
			state.selections,
			'sel-layerA',
			'newFeat',
			{ stroke: '#123456' },
			true
		);

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'map1');
	});

	/**
	 * Normalizes non-array selections to empty array before update
	 */
	it('normalizes non-array selections before update', () => {
		const state: any = createBaseState();
		state.selections = null;

		mockGetMapByKey.mockImplementation((_s, k) => _s.maps.find((m: any) => m.key === k));
		mockUpdateRenderingLayers.mockReturnValue({
			changedLayers: [{ key: 'layerA', isActive: true, selectionKey: 'sel-layerA' }],
			selectionKey: 'sel-layerA',
		});
		mockUpdateSelections.mockReturnValue([
			{
				key: 'sel-layerA',
				featureKeys: ['featX'],
				featureKeyColourIndexPairs: { featX: 0 },
			},
		]);

		reduceHandlerSetFeatureKeyInSelections(state, {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'map1', layerKey: 'layerA', featureKey: 'featX' },
		} as any);

		expect(mockUpdateSelections).toHaveBeenCalledWith([], 'sel-layerA', 'featX', undefined, true);
	});

	/**
	 * Ensures overwrite behavior even if previous selection had multiple features
	 * (Handled by helper call with overwrite flag true)
	 */
	it('passes overwrite flag to selections helper for single-feature enforcement', () => {
		const state = createBaseState();
		state.selections = [
			{
				key: 'sel-layerA',
				featureKeys: ['a', 'b'],
				featureKeyColourIndexPairs: { a: 0, b: 1 },
			} as any,
		];

		mockGetMapByKey.mockImplementation((_s, k) => _s.maps.find((m: any) => m.key === k));
		mockUpdateRenderingLayers.mockReturnValue({
			changedLayers: [{ key: 'layerA', isActive: true, selectionKey: 'sel-layerA' }],
			selectionKey: 'sel-layerA',
		});
		mockUpdateSelections.mockReturnValue([
			{
				key: 'sel-layerA',
				featureKeys: ['onlyOne'],
				featureKeyColourIndexPairs: { onlyOne: 3 },
			},
		]);

		reduceHandlerSetFeatureKeyInSelections(state, {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'map1', layerKey: 'layerA', featureKey: 'onlyOne' },
		} as any);

		expect(mockUpdateSelections).toHaveBeenCalledWith(state.selections, 'sel-layerA', 'onlyOne', undefined, true);
	});
});
