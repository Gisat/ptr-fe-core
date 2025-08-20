/**
 * Tests for removing a map set from shared state.
 * Verifies:
 *  - Error when payload missing
 *  - Error when mapSetKey missing
 *  - Proper immutable removal of a map set
 *  - Behavior when removing non-existent map set (new state, same contents)
 *  - Irrelevant action type returns original state
 */
import { StateActionType } from '../enum.state.actionType';
import { createBaseState } from '../tests/state.fixture';
import { reduceHandlerMapSetRemove } from './mapSetRemove';

describe('removing a map set from state', () => {
	/**
	 * Throws when payload missing
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState({
			mapSets: [
				{ key: 'set1', maps: [], view: { zoom: 1, latitude: 0, longitude: 0 }, sync: { zoom: false, center: false } },
			] as any,
		});
		expect(() =>
			reduceHandlerMapSetRemove(state, {
				type: StateActionType.MAP_SET_REMOVE,
				payload: undefined,
			} as any)
		).toThrow('No payload or mapSetKey provided for map set remove action');
	});

	/**
	 * Throws when mapSetKey missing in payload
	 */
	it('throws when mapSetKey is missing in payload', () => {
		const state = createBaseState({
			mapSets: [
				{ key: 'set1', maps: [], view: { zoom: 1, latitude: 0, longitude: 0 }, sync: { zoom: false, center: false } },
			] as any,
		});
		expect(() =>
			reduceHandlerMapSetRemove(state, {
				type: StateActionType.MAP_SET_REMOVE,
				payload: {},
			} as any)
		).toThrow('No payload or mapSetKey provided for map set remove action');
	});

	/**
	 * Removes targeted map set immutably
	 */
	it('removes map set immutably', () => {
		const state = createBaseState({
			mapSets: [
				{
					key: 'set1',
					maps: ['map1'],
					view: { zoom: 1, latitude: 0, longitude: 0 },
					sync: { zoom: false, center: false },
				},
				{
					key: 'set2',
					maps: ['map2'],
					view: { zoom: 2, latitude: 5, longitude: 5 },
					sync: { zoom: true, center: true },
				},
			] as any,
		});
		const originalState = state;
		const originalMapSetsRef = state.mapSets;
		const originalSet2 = state.mapSets[1];

		const newState = reduceHandlerMapSetRemove(state, {
			type: StateActionType.MAP_SET_REMOVE,
			payload: { mapSetKey: 'set1' },
		} as any);

		expect(newState).not.toBe(originalState);
		expect(newState.mapSets).not.toBe(originalMapSetsRef);
		expect(newState.mapSets).toHaveLength(1);
		expect(newState.mapSets[0]).toBe(originalSet2);
		expect(originalMapSetsRef).toHaveLength(2); // original untouched
	});

	/**
	 * Removing non-existent key yields new state with identical contents
	 */
	it('returns new state with unchanged contents when key not found', () => {
		const state = createBaseState({
			mapSets: [
				{ key: 'set1', maps: [], view: { zoom: 1, latitude: 0, longitude: 0 }, sync: { zoom: false, center: false } },
				{ key: 'set2', maps: [], view: { zoom: 2, latitude: 5, longitude: 5 }, sync: { zoom: true, center: true } },
			] as any,
		});
		const originalMapSetsRef = state.mapSets;
		const originalSetRefs = [...state.mapSets];

		const newState = reduceHandlerMapSetRemove(state, {
			type: StateActionType.MAP_SET_REMOVE,
			payload: { mapSetKey: 'unknown' },
		} as any);

		expect(newState).not.toBe(state);
		expect(newState.mapSets).not.toBe(originalMapSetsRef);
		expect(newState.mapSets).toHaveLength(2);
		expect(newState.mapSets[0]).toBe(originalSetRefs[0]);
		expect(newState.mapSets[1]).toBe(originalSetRefs[1]);
	});

	/**
	 * Irrelevant action type returns original state
	 */
	it('returns original state for unrelated action type', () => {
		const state = createBaseState({
			mapSets: [
				{ key: 'set1', maps: [], view: { zoom: 1, latitude: 0, longitude: 0 }, sync: { zoom: false, center: false } },
			] as any,
		});
		const newState = reduceHandlerMapSetRemove(state, {
			type: StateActionType.MAP_LAYER_ADD, // unrelated action
			payload: { mapKey: 'map1', layer: { key: 'layerX' } },
		} as any);
		expect(newState).toBe(state);
	});
});
