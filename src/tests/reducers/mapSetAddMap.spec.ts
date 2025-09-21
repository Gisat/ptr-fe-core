import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetAddMap } from '../../client/shared/appState/reducerHandlers/mapSetAddMap';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapAddToMapSet } from '../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const mapSet = (key: string, maps: string[] = ['map-a']): MapSetModel => ({
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

// Clone only the slices the reducer cares about
const createFakeState = (mapSets: MapSetModel[], maps: SingleMapModel[] = []): AppSharedState => ({
	...fullAppSharedStateMock,
	mapSets: mapSets.map((set) => ({ ...set, maps: [...set.maps], sync: { ...set.sync }, view: { ...set.view } })),
	maps: maps.map((map) => ({
		...map,
		view: { ...map.view },
		renderingLayers: map.renderingLayers.map((layer) => ({ ...layer })),
	})),
});

const action = (payload: ActionMapAddToMapSet['payload']): ActionMapAddToMapSet => ({
	type: StateActionType.MAP_ADD_TO_MAP_SET,
	payload,
});

describe('Shared state reducer: mapSetAddMap', () => {
	it('appends a new map reference to the target map set and stores the map', () => {
		// Before: map set has one map, state knows about map-a only
		const fakeState = createFakeState([mapSet('regional-overview')], [mapModel('map-a')]);
		const newMap = mapModel('map-b');

		// After: reducer should add the map key to the set and the map to state.maps
		const result = reduceHandlerMapSetAddMap(fakeState, action({ mapSetKey: 'regional-overview', map: newMap }));

		expect(result.mapSets[0].maps).toEqual(['map-a', 'map-b']);
		expect(result.maps).toHaveLength(fakeState.maps.length + 1);
		expect(result.maps.at(-1)).toBe(newMap);
	});
});
