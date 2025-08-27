import { ActionMapSetSyncChange } from '../state.models.actions';
import { sharedStateMocks } from '../tests/state.fixture';
import { reduceHandlerMapSetSyncChange } from './mapSetSyncChange';

describe('Reducer test: MapSet sync change', () => {
	/**
	 * Should update the sync property of the specified map set.
	 */
	it('should update the sync property of the specified map set', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const action: ActionMapSetSyncChange = {
			type: 'MAP_SET_SYNC_CHANGE' as any,
			payload: { key: 'mapSet1', syncChange: { zoom: true, center: true } },
		};

		const newState = reduceHandlerMapSetSyncChange(state, action);

		const mapSet = newState.mapSets.find((ms) => ms.key === 'mapSet1');
		expect(mapSet).toBeDefined();
		expect(mapSet!.sync.zoom).toBe(true);
		expect(mapSet!.sync.center).toBe(true);
	});

	/**
	 * Should throw an error if the map set key does not exist.
	 */
	it('should throw if the map set key does not exist', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const action: ActionMapSetSyncChange = {
			type: 'MAP_SET_SYNC_CHANGE' as any,
			payload: { key: 'nonexistent-mapset', syncChange: { zoom: true } },
		};

		expect(() => reduceHandlerMapSetSyncChange(state, action)).toThrow('MapSet with key nonexistent-mapset not found');
	});

	/**
	 * Should throw an error if no payload is provided.
	 */
	it('should throw if no payload is provided', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const action = {
			type: 'MAP_SET_SYNC_CHANGE' as any,
			payload: undefined,
		} as any;

		expect(() => reduceHandlerMapSetSyncChange(state, action)).toThrow(
			'No payload provided for map set sync change action'
		);
	});
});
