/**
 * Tests for removing multiple maps from a map set by keys.
 * Verifies:
 *  - Error when payload missing
 *  - Error when target map set not found
 *  - Proper immutable removal of listed maps (subset)
 *  - Only targeted map set object cloned; others keep reference
 *  - Global maps array filtered accordingly
 *  - Behavior when removing keys none of which are in map set (map set maps unchanged, globals still filtered)
 *  - Behavior when removing all maps from the map set
 */
import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveMapSetMapsByKeys } from '../../../../client/shared/appState/reducerHandlers/mapSetRemoveMapsByKeys';
import { createBaseState } from '../../../../client/shared/appState/tests/state.fixture';

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
				key: 'set1',
				maps: ['map1', 'map2'],
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
			},
		] as any,
	});
	expect(() =>
		reduceHandlerRemoveMapSetMapsByKeys(state, {
			type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
			payload: undefined,
		} as any)
	).toThrow('No payload provided for remove maps from map set by keys action');
});

/**
 * Throws when target map set not found
 */
it('throws when map set not found', () => {
	const state = createBaseState({
		mapSets: [] as any,
	});
	mockGetMapSetByKey.mockReturnValue(undefined);

	expect(() =>
		reduceHandlerRemoveMapSetMapsByKeys(state, {
			type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
			payload: { mapSetKey: 'missing', mapKeys: ['map1'] },
		} as any)
	).toThrow('MapSet with key missing not found');

	expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'missing');
});

/**
 * Removes a subset of maps from targeted map set & global maps immutably
 */
it('removes listed maps (subset) immutably', () => {
	const state = createBaseState({
		mapSets: [
			{
				key: 'set1',
				maps: ['map1', 'map2', 'map3'],
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
		maps: [
			...createBaseState().maps,
			{
				key: 'map3',
				name: 'Map 3',
				renderingLayers: [],
				view: { center: [2, 2], zoom: 6, boxRange: 100 },
			},
		] as any,
	});
	const originalState = state;
	const originalMapSetsRef = state.mapSets;
	const originalSet1 = state.mapSets[0];
	const originalSet2 = state.mapSets[1];
	const originalMapsRef = state.maps;

	mockGetMapSetByKey.mockImplementation((_s, k) => _s.mapSets.find((ms: any) => ms.key === k));

	const action = {
		type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
		payload: { mapSetKey: 'set1', mapKeys: ['map1', 'map3'] },
	} as any;

	const newState = reduceHandlerRemoveMapSetMapsByKeys(state, action);

	// Immutability
	expect(newState).not.toBe(originalState);
	expect(newState.mapSets).not.toBe(originalMapSetsRef);
	expect(newState.maps).not.toBe(originalMapsRef);

	// Target map set cloned & filtered
	const updatedSet1 = newState.mapSets.find((ms: any) => ms.key === 'set1');
	const updatedSet2 = newState.mapSets.find((ms: any) => ms.key === 'set2');
	expect(updatedSet1).not.toBe(originalSet1);
	expect(updatedSet2).toBe(originalSet2);
	expect(updatedSet1?.maps).toEqual(['map2']);
	expect(originalSet1.maps).toEqual(['map1', 'map2', 'map3']); // untouched

	// Global maps filtered (map1 & map3 removed)
	expect(newState.maps.map((m: any) => m.key)).toEqual(['map2']);
	expect(originalMapsRef.map((m: any) => m.key)).toEqual(['map1', 'map2', 'map3']);

	expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'set1');
});

/**
 * When none of the keys are present in map set maps, map set maps stay same but global maps still filtered
 */
it('filters global maps even if none of the keys are in map set maps', () => {
	const state = createBaseState({
		mapSets: [
			{
				key: 'set1',
				maps: ['map2'],
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
			},
		] as any,
		maps: [
			...createBaseState().maps,
			{
				key: 'map3',
				name: 'Map 3',
				renderingLayers: [],
				view: { center: [2, 2], zoom: 6, boxRange: 100 },
			},
		] as any,
	});
	const originalSet1 = state.mapSets[0];
	const originalMapsRef = state.maps;

	mockGetMapSetByKey.mockImplementation((_s, k) => _s.mapSets.find((ms: any) => ms.key === k));

	const newState = reduceHandlerRemoveMapSetMapsByKeys(state, {
		type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
		payload: { mapSetKey: 'set1', mapKeys: ['map1', 'map3'] },
	} as any);

	const updatedSet1 = newState.mapSets[0];

	// Map set cloned
	expect(updatedSet1).not.toBe(originalSet1);
	expect(updatedSet1).toBeDefined();
	// Its maps unchanged (map1/map3 not present originally)
	expect(updatedSet1!.maps).toEqual(['map2']);

	// Global maps lost map1 & map3
	expect(newState.maps.map((m: any) => m.key)).toEqual(['map2']);
	expect(originalMapsRef.map((m: any) => m.key)).toEqual(['map1', 'map2', 'map3']);
});

/**
 * Removing all maps from map set results in empty maps list for that set & filtered global maps
 */
it('removes all maps from map set resulting in empty maps list', () => {
	const state = createBaseState({
		mapSets: [
			{
				key: 'set1',
				maps: ['map1', 'map2'],
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
			},
		] as any,
	});
	const originalSet1 = state.mapSets[0];
	const originalMapsRef = state.maps;

	mockGetMapSetByKey.mockImplementation((_s, k) => _s.mapSets.find((ms: any) => ms.key === k));

	const newState = reduceHandlerRemoveMapSetMapsByKeys(state, {
		type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
		payload: { mapSetKey: 'set1', mapKeys: ['map1', 'map2'] },
	} as any);

	const updatedSet1 = newState.mapSets[0];
	expect(updatedSet1).not.toBe(originalSet1);
	expect(updatedSet1.maps).toEqual([]);
	expect(newState.maps).toEqual([]); // all removed globally
	expect(originalMapsRef.map((m: any) => m.key)).toEqual(['map1', 'map2']);
});

/**
 * Mixed existing & non-existing map keys causes removal of existing only
 */
it('ignores non-existing keys silently while removing existing ones', () => {
	const state = createBaseState({
		mapSets: [
			{
				key: 'set1',
				maps: ['map1', 'map2'],
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
			},
		] as any,
	});
	mockGetMapSetByKey.mockImplementation((_s, k) => _s.mapSets.find((ms: any) => ms.key === k));

	const newState = reduceHandlerRemoveMapSetMapsByKeys(state, {
		type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
		payload: { mapSetKey: 'set1', mapKeys: ['map2', 'mapX'] },
	} as any);

	expect(newState.mapSets[0].maps).toEqual(['map1']);
	expect(newState.maps.map((m: any) => m.key)).toEqual(['map1']);
});
