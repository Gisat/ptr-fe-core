/**
 * Tests for adding a map set to shared state.
 * Verifies:
 *  - Error when payload missing
 *  - New map set appended immutably
 *  - Duplicate key ignored (state reference unchanged)
 *  - Irrelevant action type returns original state
 */
import { MapSetModel } from '../../models/models.mapSet';
import { StateActionType } from '../enum.state.actionType';
import { createBaseState } from '../tests/state.fixture';
import { reduceHandlerMapSetAddMapSet } from './mapSetAdd';

describe('adding a map set to state', () => {
	/**
	 * Throws when payload missing
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState();
		expect(() =>
			reduceHandlerMapSetAddMapSet(state, {
				type: StateActionType.MAP_SET_ADD,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for map set add action');
	});

	/**
	 * Appends new map set immutably
	 */
	it('adds new map set immutably', () => {
		const state = createBaseState();
		const originalState = state;
		const originalMapSetsRef = state.mapSets;

		const newMapSet: MapSetModel = {
			key: 'mapSet1',
			maps: ['map1'],
			view: { zoom: 3, latitude: 10, longitude: 20 },
			sync: { zoom: true, center: false },
		} as any;

		const newState = reduceHandlerMapSetAddMapSet(state, {
			type: StateActionType.MAP_SET_ADD,
			payload: newMapSet,
		} as any);

		expect(newState).not.toBe(originalState);
		expect(newState.mapSets).not.toBe(originalMapSetsRef);
		expect(newState.mapSets).toHaveLength(1);
		expect(newState.mapSets[0]).toEqual(newMapSet);
		expect(originalMapSetsRef).toHaveLength(0); // original not mutated
	});

	/**
	 * Duplicate key ignored (returns original state reference)
	 */
	it('ignores duplicate map set key', () => {
		const state = createBaseState({
			mapSets: [
				{
					key: 'mapSet1',
					maps: ['map1'],
					view: { zoom: 2, latitude: 0, longitude: 0 },
					sync: { zoom: true, center: true },
				},
			] as any,
		});

		const duplicate: MapSetModel = {
			key: 'mapSet1',
			maps: ['map2'],
			view: { zoom: 5, latitude: 5, longitude: 5 },
			sync: { zoom: false, center: false },
		} as any;

		const newState = reduceHandlerMapSetAddMapSet(state, {
			type: StateActionType.MAP_SET_ADD,
			payload: duplicate,
		} as any);

		expect(newState).toBe(state);
		expect(newState.mapSets).toBe(state.mapSets);
		expect(newState.mapSets).toHaveLength(1);
	});

	/**
	 * Irrelevant action type returns original state
	 */
	it('returns original state for unrelated action type', () => {
		const state = createBaseState();
		const newState = reduceHandlerMapSetAddMapSet(state, {
			type: StateActionType.MAP_LAYER_ADD, // different action
			payload: { mapKey: 'map1', layer: { key: 'x' } },
		} as any);
		expect(newState).toBe(state);
	});
});
