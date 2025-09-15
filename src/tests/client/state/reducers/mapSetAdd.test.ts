/**
 * @file Unit tests for the mapSetAdd reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetAddMapSet } from '../../../../client/shared/appState/reducerHandlers/mapSetAdd';
import { ActionMapSetAdd } from '../../../../client/shared/appState/state.models.actions';
// Local minimal type for map set to decouple tests from production types
type TestMapSet = {
  key: string;
  maps: string[];
  view: Partial<{ zoom: number; latitude: number; longitude: number }>;
  sync: { zoom: boolean; center: boolean };
  mode?: 'slider' | 'grid';
};
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet add', () => {
	it('adds a new mapSet when key does not exist', () => {
    const state = { ...fullAppSharedStateMock, mapSets: [] as TestMapSet[] };
    const newMapSet: TestMapSet = {
			key: 'set-new',
			maps: [],
			sync: { zoom: true, center: false },
			view: { zoom: 3, latitude: 0, longitude: 0 },
			mode: 'grid',
		};

		const action: ActionMapSetAdd = { type: StateActionType.MAP_SET_ADD, payload: newMapSet };
		const result = reduceHandlerMapSetAddMapSet(state, action);

		expect(result).not.toBe(state);
		expect(result.mapSets).toHaveLength(1);
		expect(result.mapSets).not.toBe(state.mapSets);
		expect(result.mapSets[0]).toEqual(newMapSet);

		// Other slices preserved by reference
		expect(result.maps).toBe(state.maps);
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);
	});

	it('does not add duplicate mapSet and returns original state', () => {
    const existing: TestMapSet = {
			key: 'set-1',
			maps: [],
			sync: { zoom: false, center: true },
			view: {},
			mode: 'slider',
		};
    const state = { ...fullAppSharedStateMock, mapSets: [existing] as TestMapSet[] };

    const duplicate: TestMapSet = { ...existing, view: { zoom: 5 } };
		const action: ActionMapSetAdd = { type: StateActionType.MAP_SET_ADD, payload: duplicate };

		const result = reduceHandlerMapSetAddMapSet(state, action);

		expect(result).toBe(state);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.mapSets).toHaveLength(1);
		expect(result.mapSets[0]).toEqual(existing);
	});
});
