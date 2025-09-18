/**
 * @file Unit tests for the mapLayerOpacityChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerOpacityChange } from '../../../../client/shared/appState/reducerHandlers/mapLayerOpacityChange';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Map layer opacity change', () => {
	it('sets opacity for the specified layer in the target map', () => {
		const state = { ...fullAppSharedStateMock };

		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const beforeMapB = state.maps.find((m) => m.key === 'mapB')!;

		const action = {
			type: StateActionType.MAP_LAYER_OPACITY_CHANGE,
			payload: { mapKey: 'mapA', layerKey: 'n80', opacity: 0.5 },
		} as const;

		const result = reduceHandlerMapLayerOpacityChange(state, action);

		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;
		const afterMapB = result.maps.find((m) => m.key === 'mapB')!;

		// Immutability and targeted updates
		expect(result).not.toBe(state);
		expect(result.maps).not.toBe(state.maps);
		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapB).toBe(beforeMapB);

		// Only targeted layer changed
		expect(afterMapA.renderingLayers.find((l) => l.key === 'n80')?.opacity).toBe(0.5);
		expect(afterMapA.renderingLayers.find((l) => l.key === 'cartoLightNoLabels')?.opacity).toBeUndefined();

		// Other slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.styles).toBe(state.styles);
	});

	it('returns updated state even if layer key not found without altering layers content', () => {
		const state = { ...fullAppSharedStateMock };
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;

		const action = {
			type: StateActionType.MAP_LAYER_OPACITY_CHANGE,
			payload: { mapKey: 'mapA', layerKey: 'non-existent', opacity: 0.7 },
		} as const;

		const result = reduceHandlerMapLayerOpacityChange(state, action);
		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;

		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapA.renderingLayers).toEqual(beforeMapA.renderingLayers);
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_OPACITY_CHANGE,
			payload: { mapKey: 'missing', layerKey: 'n80', opacity: 0.2 },
		} as const;
		expect(() => reduceHandlerMapLayerOpacityChange(state, action)).toThrow('Map with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		// @ts-expect-error runtime check for missing payload
		expect(() =>
			reduceHandlerMapLayerOpacityChange(state, {
				type: StateActionType.MAP_LAYER_OPACITY_CHANGE,
			} as const)
		).toThrow('No payload provided for map layer opacity change action');
	});
});
