/**
 * Unit tests for reduceHandlerMapLayerAdd.
 *
 * Covered scenarios:
 * 1. Append new layer at end when no index provided.
 * 2. Replace existing layer when index is within current bounds.
 * 3. Append when index equals or exceeds current length.
 * 4. Error when payload is missing.
 * 5. Error when target map is not found.
 *
 * Additional checks:
 * - Immutability of maps array and replaced map object.
 */
import { reduceHandlerMapLayerAdd } from '../../../../client/shared/appState/reducerHandlers/mapLayerAdd';
import { AppSharedState } from '../../../../client/shared/appState/state.models';
import { ActionMapLayerAdd } from '../../../../client/shared/appState/state.models.actions';
import { sharedStateMocks } from '../../../../client/shared/appState/tests/state.fixture';

// Minimal shape for a map rendering layer (inferred from fixtures)
interface TestMapRenderingLayer {
	key: string;
	isActive: boolean;
	opacity?: number;
	[index: string]: unknown;
}

describe('Reducer test: mapLayerAdd (reduceHandlerMapLayerAdd)', () => {
	it('appends a new layer at the end when no index is provided', () => {
		const state: AppSharedState = JSON.parse(JSON.stringify(sharedStateMocks.twoLayersFound));
		const originalMap = state.maps.find((m) => m.key === 'map1')!;
		const originalLayers = originalMap.renderingLayers.slice();

		const newLayer: TestMapRenderingLayer = { key: 'layer-3', isActive: true, opacity: 1 };
		const action: ActionMapLayerAdd = {
			type: 'MAP_LAYER_ADD' as ActionMapLayerAdd['type'],
			payload: {
				mapKey: 'map1',
				layer: newLayer,
			},
		};

		const newState = reduceHandlerMapLayerAdd(state, action);
		const updatedMap = newState.maps.find((m) => m.key === 'map1')!;

		// Original state not mutated
		expect(originalMap.renderingLayers).toEqual(originalLayers);
		// New map object instance
		expect(updatedMap).not.toBe(originalMap);
		// New layer appended
		expect(updatedMap.renderingLayers).toHaveLength(3);
		expect(updatedMap.renderingLayers[2]).toEqual(newLayer);
		// Existing layers preserved in order
		expect(updatedMap.renderingLayers[0]).toEqual(originalLayers[0]);
		expect(updatedMap.renderingLayers[1]).toEqual(originalLayers[1]);
	});

	it('replaces a layer at provided in-bounds index', () => {
		const state: AppSharedState = JSON.parse(JSON.stringify(sharedStateMocks.twoLayersFound));
		const originalMap = state.maps.find((m) => m.key === 'map1')!;
		const newLayer: TestMapRenderingLayer = { key: 'layer-replaced', isActive: false, opacity: 0.2 };

		const action: ActionMapLayerAdd = {
			type: 'MAP_LAYER_ADD' as ActionMapLayerAdd['type'],
			payload: {
				mapKey: 'map1',
				layer: newLayer,
				index: 1, // replace second layer
			},
		};

		const newState = reduceHandlerMapLayerAdd(state, action);
		const updatedMap = newState.maps.find((m) => m.key === 'map1')!;

		expect(updatedMap.renderingLayers).toHaveLength(2);
		expect(updatedMap.renderingLayers[1]).toEqual(newLayer);
		// First layer unchanged
		expect(updatedMap.renderingLayers[0]).toEqual(originalMap.renderingLayers[0]);
	});

	it('appends when index equals current length', () => {
		const state: AppSharedState = JSON.parse(JSON.stringify(sharedStateMocks.twoLayersFound));
		const originalMap = state.maps.find((m) => m.key === 'map1')!;
		const newLayer: TestMapRenderingLayer = { key: 'layer-append-eol', isActive: true };

		const action: ActionMapLayerAdd = {
			type: 'MAP_LAYER_ADD' as ActionMapLayerAdd['type'],
			payload: {
				mapKey: 'map1',
				layer: newLayer,
				index: originalMap.renderingLayers.length, // == length -> append
			},
		};

		const newState = reduceHandlerMapLayerAdd(state, action);
		const updatedMap = newState.maps.find((m) => m.key === 'map1')!;

		expect(updatedMap.renderingLayers).toHaveLength(3);
		expect(updatedMap.renderingLayers[2]).toEqual(newLayer);
	});

	it('appends when index is greater than current length', () => {
		const state: AppSharedState = JSON.parse(JSON.stringify(sharedStateMocks.twoLayersFound));
		const newLayer: TestMapRenderingLayer = { key: 'layer-append-outofrange', isActive: false };

		const action: ActionMapLayerAdd = {
			type: 'MAP_LAYER_ADD' as ActionMapLayerAdd['type'],
			payload: {
				mapKey: 'map1',
				layer: newLayer,
				index: 999, // out of range -> push
			},
		};

		const newState = reduceHandlerMapLayerAdd(state, action);
		const updatedMap = newState.maps.find((m) => m.key === 'map1')!;

		expect(updatedMap.renderingLayers[updatedMap.renderingLayers.length - 1]).toEqual(newLayer);
	});

	it('throws when payload is missing', () => {
		const state: AppSharedState = JSON.parse(JSON.stringify(sharedStateMocks.twoLayersFound));
		const action = {
			type: 'MAP_LAYER_ADD',
			payload: undefined,
		} as unknown as ActionMapLayerAdd;

		expect(() => reduceHandlerMapLayerAdd(state, action)).toThrow('No payload provided for map layer add action');
	});

	it('throws when map is not found', () => {
		const state: AppSharedState = JSON.parse(JSON.stringify(sharedStateMocks.unknownMap));
		const newLayer: TestMapRenderingLayer = { key: 'layer-x', isActive: true };

		const action: ActionMapLayerAdd = {
			type: 'MAP_LAYER_ADD' as ActionMapLayerAdd['type'],
			payload: {
				mapKey: 'nonexistent-map',
				layer: newLayer,
			},
		};

		expect(() => reduceHandlerMapLayerAdd(state, action)).toThrow('Map with key nonexistent-map not found');
	});
});
