import { getMapSetMaps } from '../../client/shared/appState/selectors/getMapSetMaps';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { buildAppState, buildMapSet } from '../tools/reducer.helpers';

const MAP_SET_KEY = 'map-set-1';
const MAP_KEYS = ['map-1', 'map-2'];

/**
 * Builds a map set tailored for selector testing.
 */
const createMapSet = (key: string = MAP_SET_KEY, maps: string[] = MAP_KEYS): MapSetModel =>
	buildMapSet(key, {
		maps,
		sync: { center: false, zoom: true },
		view: {},
	});

/**
 * Returns a cloned shared state containing the supplied map sets.
 */
const createFakeState = (mapSets: MapSetModel[] = [createMapSet()]): AppSharedState => ({
	...buildAppState({ mapSets }),
	mapSets,
});

describe('Shared state selector: getMapSetMaps', () => {
	it('returns map keys for the specified map set', () => {
		const expectedMapSet = createMapSet();
		const fakeState = createFakeState([expectedMapSet]);

		const result = getMapSetMaps(fakeState, MAP_SET_KEY);

		expect(result).toEqual(expectedMapSet.maps);
	});

	it('returns undefined when the map set is missing', () => {
		const fakeState = createFakeState([]);

		const result = getMapSetMaps(fakeState, MAP_SET_KEY);

		expect(result).toBeUndefined();
	});
});
