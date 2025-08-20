/**
 * Tests for changing the mode of a map set.
 * Verifies:
 *  - Error when payload missing
 *  - Error when map set not found
 *  - Proper immutable update of the targeted map set mode
 *  - Other map sets keep original object reference
 *  - Behavior when setting the same mode value again
 */
import { StateActionType } from '../enum.state.actionType';
import { createBaseState } from '../tests/state.fixture';
import { reduceHandlerMapSetModeChange } from './mapSetModeChange';

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
describe('changing the mode of a map set', () => {
	/**
	 * Throws when payload missing
	 */
	it('throws when payload is missing', () => {
		const state = createBaseState({
			mapSets: [
				{
					key: 'set1',
					maps: [],
					view: { zoom: 1, latitude: 0, longitude: 0 },
					sync: { zoom: false, center: false },
					mode: 'grid',
				},
			] as any,
		});
		expect(() =>
			reduceHandlerMapSetModeChange(state, {
				type: StateActionType.MAP_SET_MODE_CHANGE,
				payload: undefined,
			} as any)
		).toThrow('No payload provided for map set mode change action');
	});

	/**
	 * Throws when target map set does not exist
	 */
	it('throws when map set not found', () => {
		const state = createBaseState({
			mapSets: [
				{
					key: 'set1',
					maps: [],
					view: { zoom: 1, latitude: 0, longitude: 0 },
					sync: { zoom: false, center: false },
					mode: 'grid',
				},
			] as any,
		});
		mockGetMapSetByKey.mockReturnValue(undefined);

		expect(() =>
			reduceHandlerMapSetModeChange(state, {
				type: StateActionType.MAP_SET_MODE_CHANGE,
				payload: { key: 'unknown', mode: 'slider' },
			} as any)
		).toThrow('MapSet with key unknown not found');

		expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'unknown');
	});

	/**
	 * Updates targeted map set mode immutably; leaves others untouched
	 */
	it('updates mode of targeted map set immutably', () => {
		const state = createBaseState({
			mapSets: [
				{
					key: 'set1',
					maps: ['map1'],
					view: { zoom: 1, latitude: 0, longitude: 0 },
					sync: { zoom: false, center: false },
					mode: 'grid',
				},
				{
					key: 'set2',
					maps: ['map2'],
					view: { zoom: 2, latitude: 5, longitude: 5 },
					sync: { zoom: false, center: false },
					mode: 'slider',
				},
			] as any,
		});
		const originalMapSetsRef = state.mapSets;
		const originalSet1 = state.mapSets[0];
		const originalSet2 = state.mapSets[1];

		mockGetMapSetByKey.mockImplementation((_s, key) => _s.mapSets.find((ms: any) => ms.key === key));

		const newState = reduceHandlerMapSetModeChange(state, {
			type: StateActionType.MAP_SET_MODE_CHANGE,
			payload: { key: 'set1', mode: 'slider' },
		} as any);

		expect(newState).not.toBe(state);
		expect(newState.mapSets).not.toBe(originalMapSetsRef);

		const updatedSet1 = newState.mapSets.find((ms: any) => ms.key === 'set1');
		const updatedSet2 = newState.mapSets.find((ms: any) => ms.key === 'set2');

		expect(updatedSet1).not.toBe(originalSet1);
		expect(updatedSet1).toBeDefined();
		expect(updatedSet1?.mode).toBe('slider');
		expect(updatedSet2).toBe(originalSet2);
		expect(updatedSet2).toBeDefined();
		expect(updatedSet2?.mode).toBe('slider');

		expect(mockGetMapSetByKey).toHaveBeenCalledWith(state, 'set1');
	});

	/**
	 * Reapplies same mode still returns new state & new targeted object (current implementation)
	 */
	it('reapplying identical mode still clones targeted map set', () => {
		const state = createBaseState({
			mapSets: [
				{
					key: 'set1',
					maps: ['map1'],
					view: { zoom: 1, latitude: 0, longitude: 0 },
					sync: { zoom: false, center: false },
					mode: 'grid',
				},
				{
					key: 'set2',
					maps: ['map2'],
					view: { zoom: 2, latitude: 5, longitude: 5 },
					sync: { zoom: false, center: false },
					mode: 'slider',
				},
			] as any,
		});
		const originalSet1 = state.mapSets[0];

		mockGetMapSetByKey.mockImplementation((_s, key) => _s.mapSets.find((ms: any) => ms.key === key));

		const newState = reduceHandlerMapSetModeChange(state, {
			type: StateActionType.MAP_SET_MODE_CHANGE,
			payload: { key: 'set1', mode: 'grid' },
		} as any);

		const updatedSet1 = newState.mapSets.find((ms: any) => ms.key === 'set1');

		expect(updatedSet1).not.toBe(originalSet1);
		expect(updatedSet1).toBeDefined();
		expect(updatedSet1?.mode).toBe('grid');
	});
});
