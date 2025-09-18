/**
 * @file Unit tests for the mapSetAddMap reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetAddMap } from '../../../../client/shared/appState/reducerHandlers/mapSetAddMap';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

	describe('Reducer test: MapSet add map', () => {
		it('adds the map and appends its key to the target mapSet', () => {
			const state = { ...fullAppSharedStateMock };

			const newMap = {
				key: 'mapC',
				renderingLayers: [],
				view: { zoom: 3, latitude: 0, longitude: 0 },
			};

		const beforeMapSets = state.mapSets;
		const beforeMaps = state.maps;
		const beforeSet = beforeMapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		const beforeSetMapsLen = beforeSet.maps.length;

		const action = {
			type: StateActionType.MAP_ADD_TO_MAP_SET,
			payload: { mapSetKey: 'mapSetLayersDemo', map: newMap },
		} as const;

		const result = reduceHandlerMapSetAddMap(state, action);

		// Immutability
		expect(result).not.toBe(state);
		expect(result.mapSets).not.toBe(beforeMapSets);
		expect(result.maps).not.toBe(beforeMaps);

		const afterSet = result.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		expect(afterSet.maps).toHaveLength(beforeSetMapsLen + 1);
		expect(afterSet.maps[beforeSetMapsLen]).toBe('mapC');

		// Map appended to maps
		expect(result.maps[result.maps.length - 1]).toEqual(newMap);

		// Unrelated slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);
	});

	it('throws when mapSet is not found', () => {
			const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_ADD_TO_MAP_SET,
			payload: {
				mapSetKey: 'missing',
				map: { key: 'X', renderingLayers: [], view: { zoom: 1, latitude: 0, longitude: 0 } },
			},
		} as const;
		expect(() => reduceHandlerMapSetAddMap(state, action)).toThrow('MapSet with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		// @ts-expect-error runtime check for missing payload
		expect(() =>
			reduceHandlerMapSetAddMap(state, {
				type: StateActionType.MAP_ADD_TO_MAP_SET,
			} as const)
		).toThrow('No payload provided for map add to map set action');
	});
});
