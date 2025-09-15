/**
 * @file Unit tests for the mapLayerActiveChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerActiveChange } from '../../../../client/shared/appState/reducerHandlers/mapLayerActiveChange';
import { ActionMapLayerActiveChange } from '../../../../client/shared/appState/state.models.actions';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Map layer active change', () => {
	it('updates isActive for the specified layer in the target map', () => {
		const state = { ...fullAppSharedStateMock };

		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const beforeMapB = state.maps.find((m) => m.key === 'mapB')!;
		// Precondition: layer exists and is active
		expect(beforeMapA.renderingLayers.find((l) => l.key === 'n80')?.isActive).toBe(true);
		expect(beforeMapA.renderingLayers.find((l) => l.key === 'cartoLightNoLabels')?.isActive).toBe(true);

		const action: ActionMapLayerActiveChange = {
			type: StateActionType.MAP_LAYER_ACTIVE_CHANGE,
			payload: { mapKey: 'mapA', layerKey: 'n80', isActive: false },
		};

		const result = reduceHandlerMapLayerActiveChange(state, action);

		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;
		const afterMapB = result.maps.find((m) => m.key === 'mapB')!;

		// Immutability and targeted updates
		expect(result).not.toBe(state);
		expect(result.maps).not.toBe(state.maps);
		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapB).toBe(beforeMapB); // untouched map keeps reference

		// Only the targeted layer changed
		expect(afterMapA.renderingLayers.find((l) => l.key === 'n80')?.isActive).toBe(false);
		expect(afterMapA.renderingLayers.find((l) => l.key === 'cartoLightNoLabels')?.isActive).toBe(true);

		// Other state slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.styles).toBe(state.styles);
	});

	it('returns updated state even if layer key not found, without altering layers content', () => {
		const state = { ...fullAppSharedStateMock };
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;

		const action: ActionMapLayerActiveChange = {
			type: StateActionType.MAP_LAYER_ACTIVE_CHANGE,
			payload: { mapKey: 'mapA', layerKey: 'non-existent-layer', isActive: false },
		};

		const result = reduceHandlerMapLayerActiveChange(state, action);
		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;

		// Map object replaced (immutable update), but contents are equal
		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapA.renderingLayers).toEqual(beforeMapA.renderingLayers);
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapLayerActiveChange = {
			type: StateActionType.MAP_LAYER_ACTIVE_CHANGE,
			payload: { mapKey: 'does-not-exist', layerKey: 'n80', isActive: false },
		};
		expect(() => reduceHandlerMapLayerActiveChange(state, action)).toThrow('Map with key does-not-exist not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_ACTIVE_CHANGE,
			payload: undefined,
		} as unknown as ActionMapLayerActiveChange;
		expect(() => reduceHandlerMapLayerActiveChange(state, action)).toThrow(
			'No payload provided for map layer visibility change action'
		);
	});
});
