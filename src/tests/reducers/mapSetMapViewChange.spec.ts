import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetMapViewChange } from '../../client/shared/appState/reducerHandlers/mapSetMapViewChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapViewChange } from '../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const mapModel = (key: string, view: { zoom: number; latitude: number; longitude: number }): SingleMapModel => ({
	key,
	view: { ...view },
	renderingLayers: [],
});

const mapSet = (
	key: string,
	maps: string[],
	sync: { zoom: boolean; center: boolean },
	view: { zoom?: number; latitude?: number; longitude?: number }
): MapSetModel => ({
	key,
	maps: [...maps],
	sync: { ...sync },
	view: { ...view },
});

// Clone just the slices the reducer touches
const createFakeState = (mapSets: MapSetModel[], maps: SingleMapModel[]): AppSharedState => ({
	...fullAppSharedStateMock,
	mapSets: mapSets.map((set) => ({ ...set, maps: [...set.maps], sync: { ...set.sync }, view: { ...set.view } })),
	maps: maps.map((map) => ({
		...map,
		view: { ...map.view },
		renderingLayers: map.renderingLayers.map((layer) => ({ ...layer })),
	})),
});

const action = (payload: ActionMapViewChange['payload']): ActionMapViewChange => ({
	type: StateActionType.MAP_VIEW_CHANGE,
	payload,
});

describe('Shared state reducer: mapSetMapViewChange', () => {
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

		const masterView = result.maps.find((map) => map.key === 'map-master')?.view;
		expect(masterView).toEqual({ zoom: 7, latitude: 20, longitude: 0 });

		const peerView = result.maps.find((map) => map.key === 'map-peer')?.view;
		expect(peerView).toEqual({ zoom: 7, latitude: 20, longitude: 10 });

		const otherView = result.maps.find((map) => map.key === 'map-other')?.view;
		expect(otherView).toEqual({ zoom: 3, latitude: -5, longitude: -5 });
	});

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

		const masterView = result.maps.find((map) => map.key === 'map-master')?.view;
		expect(masterView).toEqual({ zoom: 8, latitude: 0, longitude: 50 });

		const peerView = result.maps.find((map) => map.key === 'map-peer')?.view;
		expect(peerView).toEqual({ zoom: 3, latitude: 0, longitude: 0 });

		const setView = result.mapSets.find((set) => set.key === 'set-b')?.view;
		expect(setView).toEqual({ zoom: 3, latitude: 0, longitude: 0 });
	});
});
