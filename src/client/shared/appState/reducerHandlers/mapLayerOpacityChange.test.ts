import { ActionMapLayerOpacityChange } from '../state.models.actions';
import { sharedStateMocks } from '../tests/state.fixture';
import { reduceHandlerMapLayerOpacityChange } from './mapLayerOpacityChange';

describe('Reducer test: Map layer opacity change', () => {
	/**
	 * Should change the opacity of the specified layer in the given map.
	 */
	it('should change the opacity of the specified layer in the map', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action: ActionMapLayerOpacityChange = {
			type: 'MAP_LAYER_OPACITY_CHANGE' as any,
			payload: { mapKey: 'map1', layerKey: 'layer-1', opacity: 0.25 },
		};

		const newState = reduceHandlerMapLayerOpacityChange(state, action);

		const map = newState.maps.find((m) => m.key === 'map1');
		expect(map).toBeDefined();
		const layer = map!.renderingLayers.find((l) => l.key === 'layer-1');
		expect(layer).toBeDefined();
		expect(layer!.opacity).toBe(0.25);
	});

	/**
	 * Should throw an error if the map key does not exist.
	 */
	it('should throw if the map key does not exist', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action: ActionMapLayerOpacityChange = {
			type: 'MAP_LAYER_OPACITY_CHANGE' as any,
			payload: { mapKey: 'nonexistent-map', layerKey: 'layer-1', opacity: 0.5 },
		};

		expect(() => reduceHandlerMapLayerOpacityChange(state, action)).toThrow('Map with key nonexistent-map not found');
	});

	/**
	 * Should throw an error if no payload is provided.
	 */
	it('should throw if no payload is provided', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action = {
			type: 'MAP_LAYER_OPACITY_CHANGE' as any,
			payload: undefined,
		} as any;

		expect(() => reduceHandlerMapLayerOpacityChange(state, action)).toThrow(
			'No payload provided for map layer opacity change action'
		);
	});
});
