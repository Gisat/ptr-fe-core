/**
 * @file Unit tests for the mapSetRemoveMapsByKeys reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveMapSetMapsByKeys } from '../../../../client/shared/appState/reducerHandlers/mapSetRemoveMapsByKeys';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet remove maps by keys', () => {
	it('removes multiple maps from the target mapSet and from maps', () => {
		const state = { ...fullAppSharedStateMock };

		// Precondition
		const beforeSet = state.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		expect(beforeSet.maps).toEqual(['mapA', 'mapB']);

		const action = {
			type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
			payload: { mapSetKey: 'mapSetLayersDemo', mapKeys: ['mapA', 'mapB'] },
		} as const;

		const result = reduceHandlerRemoveMapSetMapsByKeys(state, action);

		// Immutability
		expect(result).not.toBe(state);
		expect(result.mapSets).not.toBe(state.mapSets);
		expect(result.maps).not.toBe(state.maps);

		const afterSet = result.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		expect(afterSet.maps).toEqual([]);
		expect(result.maps.find((m) => m.key === 'mapA')).toBeUndefined();
		expect(result.maps.find((m) => m.key === 'mapB')).toBeUndefined();

		// Unrelated slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);
	});

	it('when none of the keys match, returns new arrays with equal content', () => {
		const state = { ...fullAppSharedStateMock };

		const action = {
			type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
			payload: { mapSetKey: 'mapSetLayersDemo', mapKeys: ['nope1', 'nope2'] },
		} as const;

		const result = reduceHandlerRemoveMapSetMapsByKeys(state, action);
		expect(result.mapSets).not.toBe(state.mapSets);
		expect(result.mapSets).toEqual(state.mapSets);
		expect(result.maps).not.toBe(state.maps);
		expect(result.maps).toEqual(state.maps);
	});

	it('throws when mapSet is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
			payload: { mapSetKey: 'missing', mapKeys: ['mapA'] },
		} as const;
		expect(() => reduceHandlerRemoveMapSetMapsByKeys(state, action)).toThrow('MapSet with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		// @ts-expect-error runtime check for missing payload
		expect(() =>
			reduceHandlerRemoveMapSetMapsByKeys(state, {
				type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
			} as const)
		).toThrow('No payload provided for remove maps from map set by keys action');
	});
});
