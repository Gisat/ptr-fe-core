import { sharedStateMocks } from '../tests/state.fixture';
import { getMapSetByKey } from './getMapSetByKey';

/**
 * Unit tests for the getMapSetByKey selector.
 *
 * This selector retrieves a map set object from the shared state using a unique map set key.
 * It is useful for coordinating synchronized map views (e.g., zoom or center sync).
 */
describe('Selector test: Get MapSet by key', () => {
	/**
	 * Test: should return the correct map set for a valid key
	 */
	test('returns map set when key exists', () => {
		const mockStateWithMapSet = {
			...sharedStateMocks.twoLayersFound,
			mapSets: [
				{
					key: 'mapSetA',
					maps: ['map1', 'map2'],
					sync: { zoom: true, center: false },
					view: { zoom: 5, latitude: 0, longitude: 0 },
				},
			],
		};

		const result = getMapSetByKey(mockStateWithMapSet, 'mapSetA');
		expect(result).toBeDefined();
		expect(result?.key).toBe('mapSetA');
		expect(result?.maps).toEqual(['map1', 'map2']);
	});

	/**
	 * Test: should return undefined for unknown map set key
	 */
	test('returns undefined for invalid key', () => {
		const result = getMapSetByKey(sharedStateMocks.twoLayersFound, 'nonexistentSet');
		expect(result).toBeUndefined();
	});

	/**
	 * Test: should return undefined if mapSets array is missing
	 */
	test('returns undefined when mapSets are missing in state', () => {
		const stateWithoutMapSets = { ...sharedStateMocks.twoLayersFound, mapSets: undefined as any };
		const result = getMapSetByKey(stateWithoutMapSets, 'mapSetA');
		expect(result).toBeUndefined();
	});
});
