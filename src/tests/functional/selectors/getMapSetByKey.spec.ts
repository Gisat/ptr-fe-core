import { getMapSetByKey } from '../../../client/shared/appState/selectors/getMapSetByKey';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { MapSetModel } from '../../../client/shared/models/models.mapSet';
import { buildAppState, buildMapSet } from '../../tools/reducer.helpers';

const MAP_SET_KEY = 'map-set-1';

/**
 * Builds a map set fixture suitable for selector testing.
 */
const createMapSet = (key: string = MAP_SET_KEY): MapSetModel =>
	buildMapSet(key, {
		maps: ['map-1'],
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

describe('Shared state selector: getMapSetByKey', () => {
	it('returns the map set matching the provided key', () => {
		const expectedMapSet = createMapSet();
		const fakeState = createFakeState([expectedMapSet]);

		const result = getMapSetByKey(fakeState, MAP_SET_KEY);

		expect(result).toBe(expectedMapSet);
	});

	it('returns undefined when key does not match any map set', () => {
		const fakeState = createFakeState();

		const result = getMapSetByKey(fakeState, 'missing-map-set');

		expect(result).toBeUndefined();
	});

	it('returns undefined when map sets slice is empty', () => {
		const fakeState = createFakeState([]);

		const result = getMapSetByKey(fakeState, MAP_SET_KEY);

		expect(result).toBeUndefined();
	});
});
