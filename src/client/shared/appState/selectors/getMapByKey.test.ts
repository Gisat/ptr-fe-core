import { getMapByKey } from './getMapByKey';
// Import mock
import { sharedStateMocks } from '../tests/state.fixture';

/**
 * Unit tests for the getMapByKey selector.
 *
 * This selector retrieves a map object from the shared state using a unique map key.
 * It is used, for example, in rendering logic (like the SingleMap component)
 * to extract view state and layer definitions for a specific map instance.
 */
describe('Selector test: Get map by key', () => {
	/**
	 * Test: returns a valid map object for an existing key
	 */
	test('returns map when key exists', () => {
		const result = getMapByKey(sharedStateMocks.twoLayersFound, 'map1');
		expect(result).toBeDefined();
		expect(result?.key).toBe('map1');
		expect(result?.view.zoom).toBe(5);
	});

	test('returns map when key exists', () => {
		const result = getMapByKey(sharedStateMocks.oneLayerMissing, 'map2');
		expect(result).toBeDefined();
		expect(result?.key).toBe('map2');
		expect(result?.view.zoom).toBe(5);
	});

	/**
	 * Test: returns undefined if map with given key is not in the state
	 */
	test('returns undefined for unknown map key', () => {
		const result = getMapByKey(sharedStateMocks.unknownMap, 'notAMap');
		expect(result).toBeUndefined();
	});

	/**
	 * Test: handles state where maps array is empty
	 */
	test('returns undefined when state has empty maps array', () => {
		const result = getMapByKey(sharedStateMocks.unknownMap, 'map1');
		expect(result).toBeUndefined();
	});
});
