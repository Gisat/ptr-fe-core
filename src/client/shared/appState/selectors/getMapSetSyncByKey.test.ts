// /tests/units/state/selectors/getMapSetSyncByKey.test.ts
import { sharedStateMocks } from '../tests/state.fixture';
import { getMapSetSyncByKey } from './getMapSetSyncByKey';

/**
 * Unit tests for the getMapSetSyncByKey selector.
 *
 * This selector returns the sync settings of a map set by its unique key.
 * Used to determine if view properties (zoom, center) are synchronized across maps.
 */
describe('Selector test: Get synced MapSet by key', () => {
	/**
	 * Fixture: mapSetSyncPresent
	 */
	const stateWithSync = {
		...sharedStateMocks.twoLayersFound,
		mapSets: [
			{
				key: 'mapSetSyncPresent',
				maps: ['map1'],
				sync: { zoom: true, center: false },
				view: { zoom: 4, latitude: 0, longitude: 0 },
			},
		],
	};

	/**
	 * Test: returns the sync object for a known map set key
	 */
	test('returns sync object when map set key exists', () => {
		const sync = getMapSetSyncByKey(stateWithSync, 'mapSetSyncPresent');
		expect(sync).toEqual({ zoom: true, center: false });
	});

	/**
	 * Test: returns undefined if map set key does not exist
	 */
	test('returns undefined for unknown map set key', () => {
		const mockState = {
			...sharedStateMocks.twoLayersFound,
			mapSets: [],
		};

		const sync = getMapSetSyncByKey(mockState, 'nonexistent');
		expect(sync).toBeUndefined();
	});

	/**
	 * Test: returns undefined if mapSets array is missing in state
	 */
	test('returns undefined when mapSets array is missing', () => {
		const mockState = {
			...sharedStateMocks.twoLayersFound,
			mapSets: undefined as any,
		};

		const sync = getMapSetSyncByKey(mockState, 'mapSetSyncPresent');
		expect(sync).toBeUndefined();
	});
});
