/**
 * @file Unit tests for the mapSetRemoveMap reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetRemoveMap } from '../../../../client/shared/appState/reducerHandlers/mapSetRemoveMap';
import { ActionMapRemoveFromMapSet } from '../../../../client/shared/appState/state.models.actions';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet remove map', () => {
	it('removes the map from the target mapSet and from maps', () => {
		const state = { ...fullAppSharedStateMock };

		const beforeMapSets = state.mapSets;
		const beforeMaps = state.maps;
		const beforeSet = state.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		expect(beforeSet.maps).toEqual(['mapA', 'mapB']);

		const action: ActionMapRemoveFromMapSet = {
			type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
			payload: { mapSetKey: 'mapSetLayersDemo', mapKey: 'mapA' },
		};

		const result = reduceHandlerMapSetRemoveMap(state, action);

		// Immutability
		expect(result).not.toBe(state);
		expect(result.mapSets).not.toBe(beforeMapSets);
		expect(result.maps).not.toBe(beforeMaps);

		const afterSet = result.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		expect(afterSet.maps).toEqual(['mapB']);
		expect(result.maps.find((m) => m.key === 'mapA')).toBeUndefined();

		// Unrelated slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);
	});

	it('when map key not in set, returns new arrays with equal content', () => {
		const state = { ...fullAppSharedStateMock };

		const action: ActionMapRemoveFromMapSet = {
			type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
			payload: { mapSetKey: 'mapSetLayersDemo', mapKey: 'nope' },
		};

		const result = reduceHandlerMapSetRemoveMap(state, action);

		// Arrays replaced but content equal
		expect(result.mapSets).not.toBe(state.mapSets);
		expect(result.mapSets).toEqual(state.mapSets);
		expect(result.maps).not.toBe(state.maps);
		expect(result.maps).toEqual(state.maps);
	});

	it('throws when mapSet is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapRemoveFromMapSet = {
			type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
			payload: { mapSetKey: 'missing', mapKey: 'mapA' },
		};
		expect(() => reduceHandlerMapSetRemoveMap(state, action)).toThrow('MapSet with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const invalidAction = { type: StateActionType.MAP_REMOVE_FROM_MAP_SET } as unknown as ActionMapRemoveFromMapSet;
		expect(() => reduceHandlerMapSetRemoveMap(state, invalidAction)).toThrow(
			'No payload provided for map remove from map set action'
		);
	});
});
