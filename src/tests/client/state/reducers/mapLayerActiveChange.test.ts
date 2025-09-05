import { reduceHandlerMapLayerActiveChange } from '../../../../client/shared/appState/reducerHandlers/mapLayerActiveChange';
import { ActionMapLayerActiveChange } from '../../../../client/shared/appState/state.models.actions';
import { sharedStateMocks } from '../../../../client/shared/appState/tests/state.fixture';

describe('Reducer test: Map layer active change', () => {
	/**
	 * Should activate the specified layer in the given map.
	 */
	it('should activate the specified layer in the map', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action: ActionMapLayerActiveChange = {
			type: 'MAP_LAYER_ACTIVE_CHANGE' as any,
			payload: { mapKey: 'map1', layerKey: 'layer-1', isActive: true },
		};

		const newState = reduceHandlerMapLayerActiveChange(state, action);

		const map = newState.maps.find((m) => m.key === 'map1');
		expect(map).toBeDefined();
		const layer = map!.renderingLayers.find((l) => l.key === 'layer-1');
		expect(layer).toBeDefined();
		expect(layer!.isActive).toBe(true);
	});

	/**
	 * Should deactivate the specified layer in the given map.
	 */
	it('should deactivate the specified layer in the map', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action: ActionMapLayerActiveChange = {
			type: 'MAP_LAYER_ACTIVE_CHANGE' as any,
			payload: { mapKey: 'map1', layerKey: 'layer-2', isActive: false },
		};

		const newState = reduceHandlerMapLayerActiveChange(state, action);

		const map = newState.maps.find((m) => m.key === 'map1');
		expect(map).toBeDefined();
		const layer = map!.renderingLayers.find((l) => l.key === 'layer-2');
		expect(layer).toBeDefined();
		expect(layer!.isActive).toBe(false);
	});

	/**
	 * Should throw an error if the map key does not exist.
	 */
	it('should throw if the map key does not exist', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action: ActionMapLayerActiveChange = {
			type: 'MAP_LAYER_ACTIVE_CHANGE' as any,
			payload: { mapKey: 'nonexistent-map', layerKey: 'layer-1', isActive: true },
		};

		expect(() => reduceHandlerMapLayerActiveChange(state, action)).toThrow('Map with key nonexistent-map not found');
	});

	/**
	 * Should throw an error if no payload is provided.
	 */
	it('should throw if no payload is provided', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action = {
			type: 'MAP_LAYER_ACTIVE_CHANGE' as any,
			payload: undefined,
		} as any;

		expect(() => reduceHandlerMapLayerActiveChange(state, action)).toThrow(
			'No payload provided for map layer visibility change action'
		);
	});
});
