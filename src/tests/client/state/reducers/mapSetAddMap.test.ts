/**
 * Tests for adding a map into an existing map set.
 * Verifies:
 *  - Error when payload missing
 *  - Error when target map set not found
 *  - Proper immutable update of target map set (maps array extended)
 *  - Only the targeted map set object is cloned; others keep reference
 *  - Global maps array extended immutably with the new map
 */
import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetAddMap } from '../../../../client/shared/appState/reducerHandlers/mapSetAddMap';
import { createBaseState } from '../../../../client/shared/appState/tests/state.fixture';
import { MapSetModel } from '../../../../client/shared/models/models.mapSet';

const mockGetMapSetByKey = vi.fn();

vi.mock('../selectors/getMapSetByKey', () => ({
	getMapSetByKey: (...args: any[]) => mockGetMapSetByKey(...args),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

/**
 * Main suite
 */
describe('adding a map to a map set', () => {
	/**
	 * Throws when payload is missing
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState();
		expect(() =>
			reduceHandlerMapSetAddMap(state, {
				type: StateActionType.MAP_ADD_TO_MAP_SET,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for map add to map set action');
	});

	/**
	 * Throws when map set not found
	 */
	it('throws when target map set does not exist', () => {
		const state = createBaseState();
		mockGetMapSetByKey.mockReturnValue(undefined);

		expect(() =>
			reduceHandlerMapSetAddMap(state, {
				type: StateActionType.MAP_ADD_TO_MAP_SET,
				payload: {
					mapSetKey: 'unknownSet',
					map: { key: 'map3', renderingLayers: [], view: { center: [0, 0], zoom: 3, boxRange: 100 } },
				},
			} as any)
		).toThrow('MapSet with key unknownSet not found');

		expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'unknownSet');
	});

	/**
	 * Adds a new map to target map set & maps list immutably
	 */
	it('adds map to map set and maps array immutably', () => {
		const state = createBaseState({
			mapSets: [
				{
					key: 'mapSet1',
					maps: ['map1'],
					view: { zoom: 2, latitude: 0, longitude: 0 },
					sync: { zoom: true, center: false },
				},
				{
					key: 'mapSet2',
					maps: ['map2'],
					view: { zoom: 4, latitude: 10, longitude: 10 },
					sync: { zoom: false, center: true },
				},
			] as any,
		});

		const originalState = state;
		const originalMapSetsRef = state.mapSets;
		const originalMapSet1 = state.mapSets[0];
		const originalMapSet2 = state.mapSets[1];
		const originalMapsRef = state.maps;

		const newMap = {
			key: 'map3',
			name: 'Map 3',
			renderingLayers: [],
			view: { center: [5, 5], zoom: 6, boxRange: 500 },
		} as any;

		mockGetMapSetByKey.mockImplementation((_s, key) => _s.mapSets.find((ms: MapSetModel) => ms.key === key));

		const action = {
			type: StateActionType.MAP_ADD_TO_MAP_SET,
			payload: { mapSetKey: 'mapSet1', map: newMap },
		} as any;

		const newState = reduceHandlerMapSetAddMap(state, action);

		// Overall state immutability
		expect(newState).not.toBe(originalState);

		// MapSets array replaced
		expect(newState.mapSets).not.toBe(originalMapSetsRef);
		// Only target map set object replaced
		const updatedMapSet1 = newState.mapSets.find((ms: any) => ms.key === 'mapSet1');
		const updatedMapSet2 = newState.mapSets.find((ms: any) => ms.key === 'mapSet2');
		expect(updatedMapSet1).not.toBe(originalMapSet1);
		expect(updatedMapSet2).toBe(originalMapSet2);

		// Ensure updatedMapSet1 is defined
		expect(updatedMapSet1).toBeDefined();

		// Target map set maps extended immutably
		expect(updatedMapSet1!.maps).toEqual(['map1', 'map3']);
		expect(originalMapSet1.maps).toEqual(['map1']); // original untouched

		// Global maps array extended immutably
		expect(newState.maps).not.toBe(originalMapsRef);
		expect(newState.maps).toHaveLength(originalMapsRef.length + 1);
		expect(newState.maps.at(-1)).toEqual(newMap);
		expect(originalMapsRef.at(-1)).not.toEqual(newMap); // original array untouched

		// Selector usage
		expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'mapSet1');
	});
});
