import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveMapSetMapsByKeys } from '../../client/shared/appState/reducerHandlers/mapSetRemoveMapsByKeys';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapSetRemoveMapsByKeys } from '../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const mapSet = (key: string, maps: string[]): MapSetModel => ({
	key,
	maps: [...maps],
	sync: { center: false, zoom: false },
	view: { latitude: 0, longitude: 0, zoom: 4 },
});

const mapModel = (key: string): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: [],
});

const createFakeState = (mapSets: MapSetModel[], maps: SingleMapModel[]): AppSharedState => ({
	...fullAppSharedStateMock,
	mapSets: mapSets.map((set) => ({ ...set, maps: [...set.maps], sync: { ...set.sync }, view: { ...set.view } })),
	maps: maps.map((map) => ({
		...map,
		view: { ...map.view },
		renderingLayers: map.renderingLayers.map((layer) => ({ ...layer })),
	})),
});

const action = (payload: ActionMapSetRemoveMapsByKeys['payload']): ActionMapSetRemoveMapsByKeys => ({
	type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS,
	payload,
});

/**
 * Verifies mapSetRemoveMapsByKeys prunes maps from a set and global store.
 */
describe('Shared state reducer: mapSetRemoveMapsByKeys', () => {
	/**
	 * Ensures specified map keys disappear from both the set and shared map list.
	 */
	it('removes the requested map keys from the map set and maps state', () => {
		const fakeState = createFakeState(
			[mapSet('set-a', ['map-1', 'map-2', 'map-3']), mapSet('set-b', ['map-x'])],
			[mapModel('map-1'), mapModel('map-2'), mapModel('map-3'), mapModel('map-x'), mapModel('map-y')]
		);

		const result = reduceHandlerRemoveMapSetMapsByKeys(
			fakeState,
			action({ mapSetKey: 'set-a', mapKeys: ['map-2', 'map-3'] })
		);

		// Primary set should drop the targeted keys, other sets stay intact, map store prunes matches
		expect(result.mapSets.find((set) => set.key === 'set-a')?.maps).toEqual(['map-1']);
		expect(result.mapSets.find((set) => set.key === 'set-b')?.maps).toEqual(['map-x']);
		expect(result.maps.map((map) => map.key)).toEqual(['map-1', 'map-x', 'map-y']);
	});
});
