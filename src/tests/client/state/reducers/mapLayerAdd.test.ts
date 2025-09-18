/**
 * @file Unit tests for the mapLayerAdd reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerAdd } from '../../../../client/shared/appState/reducerHandlers/mapLayerAdd';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Map layer add', () => {
	it('appends a new layer to the end when no index is provided', () => {
		const state = { ...fullAppSharedStateMock };
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const prevLen = beforeMapA.renderingLayers.length;

		const newLayer = { key: 'layer-new', isActive: true };
		const action = {
			type: StateActionType.MAP_LAYER_ADD,
			payload: { mapKey: 'mapA', layer: newLayer },
		};

		const result = reduceHandlerMapLayerAdd(state, action);

		// Immutability
		expect(result).not.toBe(state);
		expect(result.maps).not.toBe(state.maps);

		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;
		const afterMapB = result.maps.find((m) => m.key === 'mapB')!;
		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapB).toBe(state.maps.find((m) => m.key === 'mapB')); // unchanged map reference

		// Appended at the end
		expect(afterMapA.renderingLayers).toHaveLength(prevLen + 1);
		expect(afterMapA.renderingLayers[prevLen]).toEqual(newLayer);

		// Other slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.styles).toBe(state.styles);
	});

	it('replaces existing layer when index is within bounds', () => {
		const state = { ...fullAppSharedStateMock };
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;

		const index = 1; // within bounds for mock mapA (2 layers)
		const replacement = { key: 'layer-replacement', isActive: false };
		const action = {
			type: StateActionType.MAP_LAYER_ADD,
			payload: { mapKey: 'mapA', layer: replacement, index },
		};

		const result = reduceHandlerMapLayerAdd(state, action);
		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;

		expect(afterMapA.renderingLayers).toHaveLength(beforeMapA.renderingLayers.length);
		expect(afterMapA.renderingLayers[index]).toEqual(replacement);
		// Other items preserved by value
		expect(afterMapA.renderingLayers[0]).toEqual(beforeMapA.renderingLayers[0]);
	});

	it('pushes to end when index equals or exceeds length', () => {
		const state = { ...fullAppSharedStateMock };
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const len = beforeMapA.renderingLayers.length;

		const layer1 = { key: 'layer-at-len', isActive: true };
		const res1 = reduceHandlerMapLayerAdd(state, {
			type: StateActionType.MAP_LAYER_ADD,
			payload: { mapKey: 'mapA', layer: layer1, index: len },
		});
		const after1MapA = res1.maps.find((m) => m.key === 'mapA')!;
		expect(after1MapA.renderingLayers).toHaveLength(len + 1);
		expect(after1MapA.renderingLayers[len]).toEqual(layer1);

		const layer2 = { key: 'layer-beyond-len', isActive: false };
		const res2 = reduceHandlerMapLayerAdd(res1, {
			type: StateActionType.MAP_LAYER_ADD,
			payload: { mapKey: 'mapA', layer: layer2, index: len + 5 },
		});
		const after2MapA = res2.maps.find((m) => m.key === 'mapA')!;
		expect(after2MapA.renderingLayers).toHaveLength(len + 2);
		expect(after2MapA.renderingLayers[len + 1]).toEqual(layer2);
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_ADD,
			payload: { mapKey: 'not-there', layer: { key: 'x', isActive: true } },
		};
		expect(() => reduceHandlerMapLayerAdd(state, action)).toThrow('Map with key not-there not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = JSON.parse('{}');
		action.type = StateActionType.MAP_LAYER_ADD;
		expect(() => reduceHandlerMapLayerAdd(state, action)).toThrow('No payload provided for map layer add action');
	});
});
