import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetRemoveMap } from '../../client/shared/appState/reducerHandlers/mapSetRemoveMap';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapRemoveFromMapSet } from '../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const mapSet = (key, maps): MapSetModel => ({
	key,
	maps: [...maps],
	sync: { center: false, zoom: false },
	view: { latitude: 0, longitude: 0, zoom: 4 },
});

const mapModel = (key): SingleMapModel => ({
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

const action = (payload: ActionMapRemoveFromMapSet['payload']): ActionMapRemoveFromMapSet => ({
	type: StateActionType.MAP_REMOVE_FROM_MAP_SET,
	payload,
});

describe('Shared state reducer: mapSetRemoveMap', () => {
	it('removes the map key from the map set and deletes the map', () => {
		const fakeState = createFakeState(
			[mapSet('set-a', ['map-master', 'map-peer'])],
			[mapModel('map-master'), mapModel('map-peer'), mapModel('map-other')]
		);

		const result = reduceHandlerMapSetRemoveMap(fakeState, action({ mapSetKey: 'set-a', mapKey: 'map-peer' }));

		expect(result.mapSets[0].maps).toEqual(['map-master']);
		expect(result.maps.map((map) => map.key)).toEqual(['map-master', 'map-other']);
	});
});
