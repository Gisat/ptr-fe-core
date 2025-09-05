/**
 * Tests for reduceHandlerAddFeatureKeyToSelections reducer.
 * Verifies:
 *  - Error handling for missing payload and missing map
 *  - Correct updates to maps and selections
 *  - Immutability of state
 *  - Normalization of invalid selections input
 */
import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerAddFeatureKeyToSelections } from '../../../../client/shared/appState/reducerHandlers/mapLayerAddFeatureKeyToSelections';
import { AppSharedState } from '../../../../client/shared/appState/state.models';

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

/**
 * Helper to build a minimal valid shared state for tests.
 * @returns Base AppSharedState with two maps and empty selections.
 */
const createBaseState = (): AppSharedState => ({
	appNode: {
		key: 'app',
		description: null,
		lastUpdatedAt: Date.now(),
		nameDisplay: 'App',
		nameInternal: 'appInternal',
		configuration: {},
		labels: [],
	},
	renderingLayers: [],
	layers: [],
	places: [],
	mapSets: [],
	maps: [
		{
			key: 'map1',
			name: 'Map 1',
			renderingLayers: [{ key: 'layerA', isActive: true }],
			view: { center: [0, 0], zoom: 5, boxRange: 1000 },
		},
		{
			key: 'map2',
			name: 'Map 2',
			renderingLayers: [{ key: 'layerB', isActive: false }],
			view: { center: [1, 1], zoom: 4, boxRange: 1000 },
		},
	] as any,
	styles: [],
	periods: [],
	selections: [],
});

beforeEach(() => {
	vi.clearAllMocks();
});

/**
 * Main test suite for the reducer behavior.
 */
describe('reduceHandlerAddFeatureKeyToSelections', () => {
	/**
	 * Ensures the reducer throws a descriptive error when no payload is supplied.
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState();
		expect(() =>
			reduceHandlerAddFeatureKeyToSelections(state, {
				type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for adding featureKey');
	});

	/**
	 * Ensures the reducer throws when the target map does not exist.
	 * Also verifies selector invocation with expected arguments.
	 */
	it('throws when map not found', () => {
		const state = createBaseState();
		mockGetMapByKey.mockReturnValue(undefined);

		expect(() =>
			reduceHandlerAddFeatureKeyToSelections(state, {
				type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
				payload: { mapKey: 'unknown', layerKey: 'layerA', featureKey: 'feat1' },
			} as any)
		).toThrow('Map with key unknown not found');

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'unknown');
	});

	/**
	 * Validates successful update path:
	 *  - Only the targeted map is cloned and updated
	 *  - Selections updated via helper
	 *  - Rendering layers updated with selectionKey
	 *  - Immutability of state slices
	 *  - Helpers receive correct arguments
	 */
	it('updates maps and selections correctly', () => {
		const state = createBaseState();
		const originalMap1 = state.maps[0];
		const originalMap2 = state.maps[1];

		mockGetMapByKey.mockImplementation((_state, key) => _state.maps.find((m: any) => m.key === key));
		mockUpdateRenderingLayers.mockReturnValue({
			changedLayers: [{ key: 'layerA', isActive: true, selectionKey: 'sel-layerA' }],
			selectionKey: 'sel-layerA',
		});
		const newSelections = [{ key: 'sel-layerA', features: [{ featureKey: 'feat1', colorIndex: 0 }] }];
		mockUpdateSelections.mockReturnValue(newSelections);

		const action = {
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: {
				mapKey: 'map1',
				layerKey: 'layerA',
				featureKey: 'feat1',
				customSelectionStyle: { stroke: '#fff' },
			},
		} as any;

		const newState = reduceHandlerAddFeatureKeyToSelections(state, action);

		expect(newState).not.toBe(state);
		expect(newState.maps).not.toBe(state.maps);
		expect(newState.selections).toBe(newSelections);

		const updatedMap1 = newState.maps.find((m: any) => m.key === 'map1');
		const updatedMap2 = newState.maps.find((m: any) => m.key === 'map2');
		expect(updatedMap1).not.toBe(originalMap1);
		expect(updatedMap2).toBe(originalMap2);

		expect(updatedMap1?.renderingLayers).toEqual([{ key: 'layerA', isActive: true, selectionKey: 'sel-layerA' }]);

		expect(mockUpdateRenderingLayers).toHaveBeenCalledWith(originalMap1.renderingLayers, 'layerA');
		expect(mockUpdateSelections).toHaveBeenCalledWith(state.selections, 'sel-layerA', 'feat1', { stroke: '#fff' });
	});

	/**
	 * Verifies that when state.selections is not an array, it is normalized
	 * to an empty array before being passed to updateSelections.
	 */
	it('treats non-array selections as empty array', () => {
		const state = { ...createBaseState(), selections: null as any };
		mockGetMapByKey.mockImplementation((_state, key) => _state.maps.find((m: any) => m.key === key));
		mockUpdateRenderingLayers.mockReturnValue({
			changedLayers: [{ key: 'layerA', isActive: true, selectionKey: 'sel-layerA' }],
			selectionKey: 'sel-layerA',
		});
		mockUpdateSelections.mockReturnValue([{ key: 'sel-layerA', features: [{ featureKey: 'f', colorIndex: 0 }] }]);

		reduceHandlerAddFeatureKeyToSelections(state, {
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: { mapKey: 'map1', layerKey: 'layerA', featureKey: 'f' },
		} as any);

		expect(mockUpdateSelections).toHaveBeenCalledWith([], 'sel-layerA', 'f', undefined);
	});
});
