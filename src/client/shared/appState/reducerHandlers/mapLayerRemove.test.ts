/**
 * Tests for removing a layer from a map.
 * Verifies:
 *  - Error handling for missing payload
 *  - Error handling for unknown map
 *  - Proper immutable removal of a layer
 *  - Removal of related selection when selectionKey exists
 *  - No selection change when layer has no selectionKey
 *  - No changes to layer objects when layerKey not found (array recreated)
 */
import { StateActionType } from '../enum.state.actionType';
import { createBaseState } from '../tests/state.fixture';
import { reduceHandlerMapLayerRemove } from './mapLayerRemove';

const mockGetMapByKey = vi.fn();

vi.mock('../../appState/selectors/getMapByKey', () => ({
	getMapByKey: (...args: any[]) => mockGetMapByKey(...args),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

/**
 * Main suite for removing a layer from a map
 */
describe('removing a layer from a map', () => {
	/**
	 * Throws when no payload is provided
	 */
	it('throws if action payload is missing', () => {
		const state = createBaseState();
		expect(() =>
			reduceHandlerMapLayerRemove(state, {
				type: StateActionType.MAP_LAYER_REMOVE,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for map layer remove action');
	});

	/**
	 * Throws when the target map cannot be found
	 */
	it('throws if target map does not exist', () => {
		const state = createBaseState();
		mockGetMapByKey.mockReturnValue(undefined);

		expect(() =>
			reduceHandlerMapLayerRemove(state, {
				type: StateActionType.MAP_LAYER_REMOVE,
				payload: { mapKey: 'unknown', layerKey: 'layerA' },
			} as any)
		).toThrow('Map with key unknown not found');

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'unknown');
	});

	/**
	 * Removes the specified layer and its related selection (when selectionKey present) immutably
	 */
	it('removes layer and related selection immutably', () => {
		const state = createBaseState();
		// augment base state with selectionKey + selections
		state.maps[0].renderingLayers = [
			{ key: 'layerA', isActive: true, isInteractive: false, selectionKey: 'sel-layerA' },
			{ key: 'layerB', isActive: true, isInteractive: true },
		];
		state.selections = [
			{ key: 'sel-layerA', features: [{ featureKey: 'f1', colorIndex: 0 }] } as any,
			{ key: 'other-selection', features: [] } as any,
		];

		mockGetMapByKey.mockImplementation((_state, key) => _state.maps.find((m: any) => m.key === key));

		const originalState = state;
		const originalMap1 = state.maps[0];
		const originalMap2 = state.maps[1];
		const originalSelections = state.selections;

		const action = {
			type: StateActionType.MAP_LAYER_REMOVE,
			payload: { mapKey: 'map1', layerKey: 'layerA' },
		} as any;

		const newState = reduceHandlerMapLayerRemove(state, action);

		// State immutability
		expect(newState).not.toBe(originalState);
		expect(newState.maps).not.toBe(originalState.maps);
		expect(newState.selections).not.toBe(originalSelections);

		// Map1 updated, Map2 untouched
		const updatedMap1 = newState.maps.find((m: any) => m.key === 'map1');
		const updatedMap2 = newState.maps.find((m: any) => m.key === 'map2');
		expect(updatedMap1).not.toBe(originalMap1);
		expect(updatedMap2).toBe(originalMap2);

		// LayerA removed
		expect(updatedMap1?.renderingLayers.map((l: any) => l.key)).toEqual(['layerB']);

		// Related selection removed (sel-layerA), other left intact
		expect(newState.selections.find((s: any) => s.key === 'sel-layerA')).toBeUndefined();
		expect(newState.selections.find((s: any) => s.key === 'other-selection')).toBeDefined();

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'map1');
	});

	/**
	 * Keeps selections unchanged when the removed layer has no selectionKey
	 */
	it('does not change selections when removed layer lacks selectionKey', () => {
		const state = createBaseState();
		// Add selections unrelated to layerB
		state.selections = [{ key: 'some-selection', features: [] } as any];
		mockGetMapByKey.mockImplementation((_state, key) => _state.maps.find((m: any) => m.key === key));

		const originalSelections = state.selections;
		const action = {
			type: StateActionType.MAP_LAYER_REMOVE,
			payload: { mapKey: 'map1', layerKey: 'layerB' },
		} as any;

		const newState = reduceHandlerMapLayerRemove(state, action);

		expect(newState.selections).toBe(originalSelections); // unchanged reference
		expect(newState.selections.length).toBe(1);
		expect(newState.selections[0].key).toBe('some-selection');
	});

	/**
	 * Leaves layers effectively unchanged (except new array reference) when layerKey not found
	 */
	it('keeps layer objects when layerKey not found', () => {
		const state = createBaseState();
		mockGetMapByKey.mockImplementation((_state, key) => _state.maps.find((m: any) => m.key === key));

		const originalMap1 = state.maps[0];
		const originalLayerRefs = [...originalMap1.renderingLayers];

		const action = {
			type: StateActionType.MAP_LAYER_REMOVE,
			payload: { mapKey: 'map1', layerKey: 'nonExisting' },
		} as any;

		const newState = reduceHandlerMapLayerRemove(state, action);
		const updatedMap1 = newState.maps.find((m: any) => m.key === 'map1');

		expect(updatedMap1).not.toBe(originalMap1);
		expect(updatedMap1?.renderingLayers).not.toBe(originalMap1.renderingLayers);
		expect(updatedMap1?.renderingLayers.length).toBe(originalLayerRefs.length);

		// Each layer object reference is identical
		updatedMap1?.renderingLayers.forEach((layer: any, idx: number) => {
			expect(layer).toBe(originalLayerRefs[idx]);
		});
	});
});
