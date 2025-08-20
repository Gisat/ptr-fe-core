/**
 * Tests for changing a single map view inside a map set.
 * Verifies:
 *  - Error when payload missing
 *  - Error when target map not found
 *  - Error when parent map set not found
 *  - Updating only the targeted map when sync is disabled (immutability + reference checks)
 *  - Synchronizing zoom & center across all maps in the map set when sync is enabled
 *  - Updating map set aggregated view when sync enabled
 */
import { ActionMapViewChange } from '../state.models.actions';
import { sharedStateMocks } from '../tests/state.fixture';
import { reduceHandlerMapSetMapViewChange } from './mapSetMapViewChange';

describe('changing a map view within a map set', () => {
	/**
	 * Should update only the specified map's view if sync is off.
	 * Ensures:
	 *  - State & maps array cloned
	 *  - Only targeted map object cloned
	 *  - Non-targeted map & map set object references preserved
	 *  - Map set aggregated view unchanged
	 */
	it('updates only the specified map view when sync is disabled', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const originalState = state;
		const originalMapsRef = state.maps;
		const originalMapSetRef = state.mapSets[0];
		const originalMap1 = state.maps.find((m) => m.key === 'map1');
		const originalMap2 = state.maps.find((m) => m.key === 'map2');

		const action: ActionMapViewChange = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: { key: 'map1', viewChange: { zoom: 5, latitude: 50, longitude: 15 } },
		};

		const newState = reduceHandlerMapSetMapViewChange(state, action);

		// Immutability
		expect(newState).not.toBe(originalState);
		expect(newState.maps).not.toBe(originalMapsRef);

		// Non-synced: map set should not be cloned (view unchanged)
		expect(newState.mapSets[0]).toBe(originalMapSetRef);

		const updatedMap1 = newState.maps.find((m) => m.key === 'map1');
		const updatedMap2 = newState.maps.find((m) => m.key === 'map2');

		expect(updatedMap1).not.toBe(originalMap1);
		expect(updatedMap1?.view.zoom).toBe(5);
		expect(updatedMap1?.view.latitude).toBe(50);
		expect(updatedMap1?.view.longitude).toBe(15);

		// Untouched map keeps reference & values
		expect(updatedMap2).toBe(originalMap2);
		expect(updatedMap2?.view.zoom).toBe(originalMap2?.view.zoom);
		expect(updatedMap2?.view.latitude).toBe(originalMap2?.view.latitude);
		expect(updatedMap2?.view.longitude).toBe(originalMap2?.view.longitude);

		// Aggregated map set view unchanged
		expect(newState.mapSets[0].view).toEqual(originalMapSetRef.view);
	});

	/**
	 * Should sync zoom and center for all maps in the set if sync is on.
	 * Ensures:
	 *  - State, maps array, and targeted map set cloned
	 *  - All maps in the set updated consistently
	 *  - Map set aggregated view updated
	 */
	it('synchronizes zoom & center across all maps when sync is enabled', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsSync };
		const originalState = state;
		const originalMapsRef = state.maps;
		const originalMapSetRef = state.mapSets[0];
		const originalMap1 = state.maps.find((m) => m.key === 'map1');
		const originalMap2 = state.maps.find((m) => m.key === 'map2');

		const action: ActionMapViewChange = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: { key: 'map1', viewChange: { zoom: 8, latitude: 60, longitude: 20 } },
		};

		const newState = reduceHandlerMapSetMapViewChange(state, action);

		// Immutability
		expect(newState).not.toBe(originalState);
		expect(newState.maps).not.toBe(originalMapsRef);
		expect(newState.mapSets[0]).not.toBe(originalMapSetRef);

		const map1 = newState.maps.find((m) => m.key === 'map1');
		const map2 = newState.maps.find((m) => m.key === 'map2');

		// Both maps updated & (likely) cloned
		expect(map1).not.toBe(originalMap1);
		expect(map2).not.toBe(originalMap2);
		['zoom', 'latitude', 'longitude'].forEach((prop) => {
			expect((map1 as any).view[prop]).toBe((map2 as any).view[prop]);
			expect((map1 as any).view[prop]).toBe((action.payload as any).viewChange[prop]);
		});

		// Map set aggregated view updated
		const mapSet = newState.mapSets.find((ms) => ms.key === 'mapSet1');
		expect(mapSet?.view.zoom).toBe(8);
		expect(mapSet?.view.latitude).toBe(60);
		expect(mapSet?.view.longitude).toBe(20);
	});

	/**
	 * Throws when the map key does not exist.
	 */
	it('throws when the specified map key does not exist', () => {
		const state = { ...sharedStateMocks.mapSetWithTwoMapsNoSync };
		const action: ActionMapViewChange = {
			type: 'MAP_VIEW_CHANGE' as any,
			payload: { key: 'nonexistent-map', viewChange: { zoom: 10 } },
		};
		expect(() => reduceHandlerMapSetMapViewChange(state, action)).toThrow('Map with key nonexistent-map not found');
	});

	/**
	 * Throws when the parent map set for the map is not found.
	 */
	it('throws when the parent map set does not exist', () => {
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
	 * Throws when payload is missing.
	 */
	it('throws when payload is missing', () => {
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
