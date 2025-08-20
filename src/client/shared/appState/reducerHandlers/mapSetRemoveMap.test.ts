/**
 * Tests for removing a map from an existing map set.
 * Verifies:
 *  - Error when payload missing
 *  - Error when target map set not found
 *  - Proper immutable update (map removed from map set + global maps)
 *  - Only targeted map set object cloned; others keep reference
 *  - Behavior when removing map not listed in map set (still removes global map)
 */
import { StateActionType } from '../enum.state.actionType';
import { createBaseState } from '../tests/state.fixture';
import { reduceHandlerMapSetRemoveMap } from './mapSetRemoveMap';

const mockGetMapSetByKey = vi.fn();

vi.mock('../selectors/getMapSetByKey', () => ({
	getMapSetByKey: (...args: any[]) => mockGetMapSetByKey(...args),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

/**
 * Throws when payload missing
 */
it('throws when payload is missing', () => {
	const state = createBaseState({
		mapSets: [
			{
				key: 'mapSet1',
				maps: ['map1', 'map2'],
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
			},
		] as any,
	});
	expect(() =>
		reduceHandlerMapSetRemoveMap(state, {
			type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
			payload: undefined,
		} as any)
	).toThrow('No payload provided for map remove from map set action');
});

/**
 * Throws when map set not found
 */
it('throws when target map set does not exist', () => {
	const state = createBaseState({
		mapSets: [] as any,
	});
	mockGetMapSetByKey.mockReturnValue(undefined);

	expect(() =>
		reduceHandlerMapSetRemoveMap(state, {
			type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
			payload: { mapSetKey: 'missing', mapKey: 'map1' },
		} as any)
	).toThrow('MapSet with key missing not found');

	expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'missing');
});

/**
 * Removes map from map set & global maps immutably
 */
it('removes map from map set and global maps immutably', () => {
	const state = createBaseState({
		mapSets: [
			{
				key: 'mapSet1',
				maps: ['map1', 'map2'],
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
			},
			{
				key: 'mapSet2',
				maps: ['map2'],
				view: { zoom: 2, latitude: 10, longitude: 10 },
				sync: { zoom: true, center: true },
			},
		] as any,
		// maps already provided by fixture: map1, map2
	});

	const originalState = state;
	const originalMapSetsRef = state.mapSets;
	const originalMapsRef = state.maps;
	const originalMapSet1 = state.mapSets[0];
	const originalMapSet2 = state.mapSets[1];

	mockGetMapSetByKey.mockImplementation((_s, key) => _s.mapSets.find((ms: any) => ms.key === key));

	const action = {
		type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
		payload: { mapSetKey: 'mapSet1', mapKey: 'map1' },
	} as any;

	const newState = reduceHandlerMapSetRemoveMap(state, action);

	// Immutability
	expect(newState).not.toBe(originalState);
	expect(newState.mapSets).not.toBe(originalMapSetsRef);
	expect(newState.maps).not.toBe(originalMapsRef);

	// Only targeted map set object cloned
	const updatedMapSet1 = newState.mapSets.find((ms: any) => ms.key === 'mapSet1');
	const updatedMapSet2 = newState.mapSets.find((ms: any) => ms.key === 'mapSet2');
	expect(updatedMapSet1).not.toBe(originalMapSet1);
	expect(updatedMapSet2).toBe(originalMapSet2);

	// Map removed from mapSet1
	expect(updatedMapSet1?.maps).toEqual(['map2']);
	// Global maps updated
	expect(newState.maps.map((m: any) => m.key)).toEqual(['map2']);
	// Original untouched
	expect(originalMapSet1.maps).toEqual(['map1', 'map2']);
	expect(originalMapsRef.map((m: any) => m.key)).toEqual(['map1', 'map2']);

	expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'mapSet1');
});

/**
 * Removes global map even if it is not listed inside map set maps
 * (targeted map set still cloned with unchanged maps array)
 */
it('removes global map even if map not present in map set maps', () => {
	const state = createBaseState({
		mapSets: [
			{
				key: 'mapSet1',
				maps: ['map2'], // map1 not listed
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
			},
		] as any,
		// maps from fixture: map1 & map2
	});

	const originalMapSet1 = state.mapSets[0];
	const originalMapsRef = state.maps;

	mockGetMapSetByKey.mockImplementation((_s, key) => _s.mapSets.find((ms: any) => ms.key === key));

	const newState = reduceHandlerMapSetRemoveMap(state, {
		type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
		payload: { mapSetKey: 'mapSet1', mapKey: 'map1' },
	} as any);

	const updatedMapSet1 = newState.mapSets[0];

	// Cloned map set (even though maps list unchanged)
	expect(updatedMapSet1).not.toBe(originalMapSet1);
	expect(updatedMapSet1).toBeDefined();
	expect(updatedMapSet1.maps).toEqual(['map2']);

	// Global maps lost map1
	expect(newState.maps.map((m: any) => m.key)).toEqual(['map2']);
	expect(originalMapsRef.map((m: any) => m.key)).toEqual(['map1', 'map2']);
});
