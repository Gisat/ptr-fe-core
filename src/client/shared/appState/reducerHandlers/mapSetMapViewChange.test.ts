import { ActionMapViewChange } from '../state.models.actions';
import { sharedStateMocks } from '../tests/state.fixture';
import { reduceHandlerMapSetMapViewChange } from './mapSetMapViewChange';

describe('Reducer test: MapSet map view change', () => {
	/**
	 * Should update only the specified map's view if sync is off.
	 */
	it('should update only the specified map view when sync is off', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const action: ActionMapViewChange = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: { key: 'map1', viewChange: { zoom: 5, latitude: 50, longitude: 15 } },
		};

		const newState = reduceHandlerMapSetMapViewChange(state, action);

		const map = newState.maps.find((m) => m.key === 'map1');
		expect(map?.view.zoom).toBe(5);
		expect(map?.view.latitude).toBe(50);
		expect(map?.view.longitude).toBe(15);

		const otherMap = newState.maps.find((m) => m.key === 'map2');
		expect(otherMap?.view.zoom).not.toBe(5);
		expect(otherMap?.view.latitude).not.toBe(50);
		expect(otherMap?.view.longitude).not.toBe(15);
	});

	/**
	 * Should sync zoom and center for all maps in the set if sync is on.
	 */
	it('should sync zoom and center for all maps in the set when sync is on', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsSync };
		const action: ActionMapViewChange = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: { key: 'map1', viewChange: { zoom: 8, latitude: 60, longitude: 20 } },
		};

		const newState = reduceHandlerMapSetMapViewChange(state, action);

		const map1 = newState.maps.find((m) => m.key === 'map1');
		const map2 = newState.maps.find((m) => m.key === 'map2');
		expect(map1?.view.zoom).toBe(8);
		expect(map2?.view.zoom).toBe(8);
		expect(map1?.view.latitude).toBe(60);
		expect(map2?.view.latitude).toBe(60);
		expect(map1?.view.longitude).toBe(20);
		expect(map2?.view.longitude).toBe(20);

		const mapSet = newState.mapSets.find((ms) => ms.key === 'mapSet1');
		expect(mapSet?.view.zoom).toBe(8);
		expect(mapSet?.view.latitude).toBe(60);
		expect(mapSet?.view.longitude).toBe(20);
	});

	/**
	 * Should throw if the map key does not exist.
	 */
	it('should throw if the map key does not exist', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const action: ActionMapViewChange = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: { key: 'nonexistent-map', viewChange: { zoom: 10 } },
		};

		expect(() => reduceHandlerMapSetMapViewChange(state, action)).toThrow('Map with key nonexistent-map not found');
	});

	/**
	 * Should throw if the parent map set does not exist.
	 */
	it('should throw if the parent map set does not exist', () => {
		const state = { ...sharedStateMocks.mapWithoutMapSet };
		const action: ActionMapViewChange = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: { key: 'map1', viewChange: { zoom: 10 } },
		};

		expect(() => reduceHandlerMapSetMapViewChange(state, action)).toThrow(
			'Parent MapSet for map with key map1 not found'
		);
	});

	/**
	 * Should throw if no payload is provided.
	 */
	it('should throw if no payload is provided', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const action = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: undefined,
		} as any;

		expect(() => reduceHandlerMapSetMapViewChange(state, action)).toThrow(
			'No payload provided for map view change action'
		);
	});
});
