import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetMapViewChange } from '../../client/shared/appState/reducerHandlers/mapSetMapViewChange';
import { ActionMapViewChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, buildMapSet, makeActionFactory } from '../tools/reducer.helpers';

// Helper: builds map model with specified view to mimic stored map positions.
const mapModel = (key: string, view: { zoom: number; latitude: number; longitude: number }) =>
	buildMapModel(key, { view });

// Helper: configures map set with sync flags and stored view snapshot.
const mapSet = (
	key: string,
	maps: string[],
	sync: { zoom: boolean; center: boolean },
	view: { zoom?: number; latitude?: number; longitude?: number }
) => buildMapSet(key, { maps, sync, view });

// Helper: assembles fake state with predetermined map sets and map collections.
const createFakeState = (mapSets: ReturnType<typeof mapSet>[], maps: ReturnType<typeof mapModel>[]) =>
	buildAppState({ mapSets, maps });

// Action factory for MAP_VIEW_CHANGE with typed payload.
const action = makeActionFactory<ActionMapViewChange>(StateActionType.MAP_VIEW_CHANGE);

/**
 * Exercises mapSetMapViewChange to ensure sync flags drive view propagation.
 */
describe('Shared state reducer: mapSetMapViewChange', () => {
	// Scenario: sync-enabled set should propagate zoom/center to sibling map and update stored snapshot.
	/**
	 * Confirms zoom/center propagate to sibling maps when sync is true.
	 */
	it('syncs zoom and center across the map set when enabled', () => {
		const fakeState = createFakeState(
			[
				mapSet(
					'set-a',
					['map-master', 'map-peer'],
					{ zoom: true, center: true },
					{ zoom: 5, latitude: 0, longitude: 0 }
				),
			],
			[
				mapModel('map-master', { zoom: 5, latitude: 0, longitude: 0 }),
				mapModel('map-peer', { zoom: 4, latitude: 10, longitude: 10 }),
				mapModel('map-other', { zoom: 3, latitude: -5, longitude: -5 }),
			]
		);

		const result = reduceHandlerMapSetMapViewChange(
			fakeState,
			action({ key: 'map-master', viewChange: { zoom: 7, latitude: 20 } })
		);

		const updatedSet = result.mapSets.find((set) => set.key === 'set-a');
		expect(updatedSet?.view.zoom).toBe(7);
		expect(updatedSet?.view.latitude).toBe(20);

		// Sibling map tied to sync should receive propagated zoom and partial center
		const masterView = result.maps.find((map) => map.key === 'map-master')?.view;
		expect(masterView).toEqual({ zoom: 7, latitude: 20, longitude: 0 });

		const peerView = result.maps.find((map) => map.key === 'map-peer')?.view;
		expect(peerView).toEqual({ zoom: 7, latitude: 20, longitude: 10 });

		// Unrelated map outside the set remains unchanged
		const otherView = result.maps.find((map) => map.key === 'map-other')?.view;
		expect(otherView).toEqual({ zoom: 3, latitude: -5, longitude: -5 });
	});

	// Scenario: sync-disabled set should only change the triggering map and leave snapshot intact.
	/**
	 * Ensures only the initiating map updates when sync is disabled.
	 */
	it('only updates the triggering map when sync flags are disabled', () => {
		const fakeState = createFakeState(
			[
				mapSet(
					'set-b',
					['map-master', 'map-peer'],
					{ zoom: false, center: false },
					{ zoom: 3, latitude: 0, longitude: 0 }
				),
			],
			[
				mapModel('map-master', { zoom: 3, latitude: 0, longitude: 0 }),
				mapModel('map-peer', { zoom: 3, latitude: 0, longitude: 0 }),
			]
		);

		const result = reduceHandlerMapSetMapViewChange(
			fakeState,
			action({ key: 'map-master', viewChange: { zoom: 8, longitude: 50 } })
		);

		// Only the initiating map should reflect the new zoom/longitude values
		const masterView = result.maps.find((map) => map.key === 'map-master')?.view;
		expect(masterView).toEqual({ zoom: 8, latitude: 0, longitude: 50 });

		const peerView = result.maps.find((map) => map.key === 'map-peer')?.view;
		expect(peerView).toEqual({ zoom: 3, latitude: 0, longitude: 0 });

		// Sync-disabled map set retains its stored view snapshot
		const setView = result.mapSets.find((set) => set.key === 'set-b')?.view;
		expect(setView).toEqual({ zoom: 3, latitude: 0, longitude: 0 });
	});
});
