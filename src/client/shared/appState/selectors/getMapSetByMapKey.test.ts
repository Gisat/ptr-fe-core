import { sharedStateMocks } from '../../../../tests/client/state/helpers/state.fixture';
import { getMapSetByMapKey } from './getMapSetByMapKey';

/**
 * Unit tests for the getMapSetByMapKey selector.
 *
 * This selector looks for a MapSet that includes a specific mapKey in its list of maps.
 * Useful for determining which map set a map belongs to.
 */
describe('Selector test: Get Mapset by map key', () => {
	/**
	 * Test: returns the correct map set for a valid map key
	 */
	test('returns map set containing given map key', () => {
		const mockState = {
			...sharedStateMocks.twoLayersFound,
			mapSets: [
				{
					key: 'set1',
					maps: ['map1', 'mapX'],
					sync: { zoom: true, center: true },
					view: { zoom: 4, latitude: 0, longitude: 0 },
				},
			],
		};

		const result = getMapSetByMapKey(mockState, 'map1');
		expect(result).toBeDefined();
		expect(result?.key).toBe('set1');
		expect(result?.maps).toContain('map1');
	});

	/**
	 * Test: returns undefined when map key is not found in any map set
	 */
	test('returns undefined when map key is not in any map set', () => {
		const mockState = {
			...sharedStateMocks.twoLayersFound,
			mapSets: [
				{
					key: 'set1',
					maps: ['mapX', 'mapY'],
					sync: { zoom: true, center: true },
					view: { zoom: 4, latitude: 0, longitude: 0 },
				},
			],
		};

		const result = getMapSetByMapKey(mockState, 'map1');
		expect(result).toBeUndefined();
	});

	/**
	 * Test: returns undefined when mapSets are missing
	 */
	test('returns undefined when mapSets array is missing', () => {
		const stateWithoutMapSets = {
			...sharedStateMocks.twoLayersFound,
			mapSets: undefined as any,
		};

		const result = getMapSetByMapKey(stateWithoutMapSets, 'map1');
		expect(result).toBeUndefined();
	});
});
