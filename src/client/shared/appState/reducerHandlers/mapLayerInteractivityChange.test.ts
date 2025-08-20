/**
 * Tests for map layer interactivity change reducer.
 * Verifies:
 *  - Error handling for missing payload
 *  - Error handling for missing map
 *  - Correct immutable update of targeted map layer interactivity
 *  - No changes to other maps
 *  - No change when layerKey not found (layer objects remain same)
 */
import { StateActionType } from '../enum.state.actionType';
import { createBaseState } from '../tests/state.fixture';
import { reduceHandlerMapLayerInteractivityChange } from './mapLayerInteractivityChange';

const mockGetMapByKey = vi.fn();

vi.mock('../../appState/selectors/getMapByKey', () => ({
	getMapByKey: (...args: any[]) => mockGetMapByKey(...args),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

/**
 * Main suite for map layer interactivity change reducer
 */
describe('map layer interactivity change reducer', () => {
	/**
	 * Ensures exception is thrown when action payload is missing
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState();
		expect(() =>
			reduceHandlerMapLayerInteractivityChange(state, {
				type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for map layer interactivity change action');
	});

	/**
	 * Ensures exception when map is not found; verifies selector usage
	 */
	it('throws when map not found', () => {
		const state = createBaseState();
		mockGetMapByKey.mockReturnValue(undefined);

		expect(() =>
			reduceHandlerMapLayerInteractivityChange(state, {
				type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
				payload: { mapKey: 'unknown', layerKey: 'layerA', isInteractive: true },
			} as any)
		).toThrow('Map with key unknown not found');

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'unknown');
	});

	/**
	 * Validates successful immutable update of layer interactivity
	 */
	it('updates interactivity for specified layer immutably', () => {
		const state = createBaseState();
		mockGetMapByKey.mockImplementation((_state, key) => _state.maps.find((m: any) => m.key === key));

		const originalMap1 = state.maps[0];
		const originalMap2 = state.maps[1];
		const originalLayerA = originalMap1.renderingLayers[0];
		const originalLayerB = originalMap1.renderingLayers[1];

		const action = {
			type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
			payload: { mapKey: 'map1', layerKey: 'layerA', isInteractive: true },
		} as any;

		const newState = reduceHandlerMapLayerInteractivityChange(state, action);

		expect(newState).not.toBe(state);
		expect(newState.maps).not.toBe(state.maps);

		const updatedMap1 = newState.maps.find((m: any) => m.key === 'map1');
		const updatedMap2 = newState.maps.find((m: any) => m.key === 'map2');

		expect(updatedMap1).not.toBe(originalMap1);
		expect(updatedMap2).toBe(originalMap2);

		expect(updatedMap1?.renderingLayers).not.toBe(originalMap1.renderingLayers);

		const updatedLayerA = updatedMap1?.renderingLayers.find((l: any) => l.key === 'layerA');
		expect(updatedLayerA).not.toBe(originalLayerA);
		expect(updatedLayerA?.isInteractive).toBe(true);

		const updatedLayerB = updatedMap1?.renderingLayers.find((l: any) => l.key === 'layerB');
		expect(updatedLayerB).toBe(originalLayerB);
		expect(updatedLayerB?.isInteractive).toBe(true);

		expect(mockGetMapByKey).toHaveBeenCalledWith(state, 'map1');
	});

	/**
	 * Ensures no layer changes when layerKey does not match any existing layer
	 */
	it('does nothing when layerKey not found (layer objects stay same)', () => {
		const state = createBaseState();
		mockGetMapByKey.mockImplementation((_state, key) => _state.maps.find((m: any) => m.key === key));

		const originalMap1 = state.maps[0];
		const originalLayerRefs = [...originalMap1.renderingLayers];

		const action = {
			type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
			payload: { mapKey: 'map1', layerKey: 'nonExisting', isInteractive: true },
		} as any;

		const newState = reduceHandlerMapLayerInteractivityChange(state, action);
		const updatedMap1 = newState.maps.find((m: any) => m.key === 'map1');

		expect(updatedMap1).not.toBe(originalMap1);
		expect(updatedMap1?.renderingLayers).not.toBe(originalMap1.renderingLayers);

		updatedMap1?.renderingLayers.forEach((layer: any, idx: number) => {
			expect(layer).toBe(originalLayerRefs[idx]);
		});
	});
});
