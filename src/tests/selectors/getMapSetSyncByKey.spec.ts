import { getMapSetSyncByKey } from '../../client/shared/appState/selectors/getMapSetSyncByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { MapSetSync } from '../../client/shared/models/models.mapSetSync';

const MAP_SET_KEY = 'mapSetA';
const DEFAULT_SYNC: MapSetSync = { zoom: true, center: false };

const createMapSet = (key: string, sync: MapSetSync): MapSetModel => ({
	key,
	maps: ['mapA'],
	sync,
	view: {},
});

const cloneMapSet = (mapSet: MapSetModel): MapSetModel => ({
	...mapSet,
	maps: [...mapSet.maps],
	sync: { ...mapSet.sync },
	view: { ...mapSet.view },
});

const createFakeState = (mapSets: MapSetModel[] = [createMapSet(MAP_SET_KEY, DEFAULT_SYNC)]): AppSharedState => ({
	appNode: {
		key: 'app',
		labels: ['application'],
		nameDisplay: 'app',
		nameInternal: 'app',
		description: '',
		lastUpdatedAt: 0,
	},
	layers: [],
	places: [],
	renderingLayers: [],
	mapSets: mapSets.map(cloneMapSet),
	maps: [],
	styles: [],
	periods: [],
	selections: [],
});

describe('Shared state selector: getMapSetSyncByKey', () => {
	it('returns sync settings when key matches', () => {
		const fakeState = createFakeState();
		const result = getMapSetSyncByKey(fakeState, MAP_SET_KEY);
		expect(result).toEqual(fakeState.mapSets[0].sync);
	});

	it('returns undefined when key is unknown', () => {
		const fakeState = createFakeState();
		const result = getMapSetSyncByKey(fakeState, 'missing-map-set');
		expect(result).toBeUndefined();
	});

	it('returns undefined when no map sets are present', () => {
		const fakeState = createFakeState([]);
		const result = getMapSetSyncByKey(fakeState, MAP_SET_KEY);
		expect(result).toBeUndefined();
	});
});
