/**
 * @file Unit tests for the mapAdd reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapAdd } from '../../../../client/shared/appState/reducerHandlers/mapAdd';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

	describe('Reducer test: Map add', () => {
		it('adds a new map when key does not exist', () => {
			const state = { ...fullAppSharedStateMock, maps: [] };
			const newMap = {
				key: 'map-new',
				view: { zoom: 3, latitude: 10, longitude: 20 },
				renderingLayers: [],
			};

			const action = { type: StateActionType.MAP_ADD, payload: newMap };
		const result = reduceHandlerMapAdd(state, action);

		expect(result).not.toBe(state);
		expect(result.maps).toHaveLength(1);
		expect(result.maps).not.toBe(state.maps);
		expect(result.maps[0]).toEqual(newMap);
	});

		it('does not add duplicate map and returns original state', () => {
			const existing = {
				key: 'map-1',
				view: { zoom: 5, latitude: 0, longitude: 0 },
				renderingLayers: [],
			};
			const state = { ...fullAppSharedStateMock, maps: [existing] };

			const duplicate = {
				key: 'map-1',
				view: { zoom: 6, latitude: 1, longitude: 1 },
				renderingLayers: [],
			};
			const action = { type: StateActionType.MAP_ADD, payload: duplicate };

		const result = reduceHandlerMapAdd(state, action);

		// Should return original state instance and keep maps unchanged
		expect(result).toBe(state);
		expect(result.maps).toBe(state.maps);
		expect(result.maps).toHaveLength(1);
		expect(result.maps[0]).toEqual(existing);
	});

		it('appends map to existing list and preserves other properties', () => {
			const existingMap = {
				key: 'map-A',
				view: { zoom: 4, latitude: 45, longitude: 9 },
				renderingLayers: [],
			};
			const state = { ...fullAppSharedStateMock, maps: [existingMap] };

			const newMap = {
				key: 'map-B',
				view: { zoom: 2, latitude: -10, longitude: 120 },
				renderingLayers: [],
			};
			const action = { type: StateActionType.MAP_ADD, payload: newMap };

		const result = reduceHandlerMapAdd(state, action);

		// Maps updated immutably with both entries
		expect(result.maps).toHaveLength(2);
		expect(result.maps.map((m) => m.key)).toEqual(['map-A', 'map-B']);
		expect(result.maps).not.toBe(state.maps);

		// Unrelated state slices preserved by reference
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.styles).toBe(state.styles);
	});
});
