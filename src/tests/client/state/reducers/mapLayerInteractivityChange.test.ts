/**
 * @file Unit tests for the mapLayerInteractivityChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerInteractivityChange } from '../../../../client/shared/appState/reducerHandlers/mapLayerInteractivityChange';
import { ActionMapLayerInteractivityChange } from '../../../../client/shared/appState/state.models.actions';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Map layer interactivity change', () => {
	it('sets isInteractive for the specified layer in the target map', () => {
		const state = { ...fullAppSharedStateMock };

		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const beforeMapB = state.maps.find((m) => m.key === 'mapB')!;

		const action: ActionMapLayerInteractivityChange = {
			type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
			payload: { mapKey: 'mapA', layerKey: 'n80', isInteractive: true },
		};

		const result = reduceHandlerMapLayerInteractivityChange(state, action);

		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;
		const afterMapB = result.maps.find((m) => m.key === 'mapB')!;

		// Immutability and targeted updates
		expect(result).not.toBe(state);
		expect(result.maps).not.toBe(state.maps);
		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapB).toBe(beforeMapB);

		// Only targeted layer changed
		expect(afterMapA.renderingLayers.find((l) => l.key === 'n80')?.isInteractive).toBe(true);
		// Others untouched
		expect(afterMapA.renderingLayers.find((l) => l.key === 'cartoLightNoLabels')?.isInteractive).toBeUndefined();

		// Other slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.styles).toBe(state.styles);
	});

	it('returns updated state even if layer key not found without altering layers content', () => {
		const state = { ...fullAppSharedStateMock };
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;

		const action: ActionMapLayerInteractivityChange = {
			type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
			payload: { mapKey: 'mapA', layerKey: 'non-existent', isInteractive: true },
		};

		const result = reduceHandlerMapLayerInteractivityChange(state, action);
		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;

		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapA.renderingLayers).toEqual(beforeMapA.renderingLayers);
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapLayerInteractivityChange = {
			type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
			payload: { mapKey: 'nope', layerKey: 'n80', isInteractive: false },
		};
		expect(() => reduceHandlerMapLayerInteractivityChange(state, action)).toThrow('Map with key nope not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
			payload: undefined,
		} as unknown as ActionMapLayerInteractivityChange;
		expect(() => reduceHandlerMapLayerInteractivityChange(state, action)).toThrow(
			'No payload provided for map layer interactivity change action'
		);
	});
});
