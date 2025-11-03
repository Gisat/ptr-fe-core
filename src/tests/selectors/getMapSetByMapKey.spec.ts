import { getMapSetByMapKey } from '../../client/shared/appState/selectors/getMapSetByMapKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { buildAppState, buildMapSet } from '../tools/reducer.helpers';

const MAP_KEY = 'map-1';
const MAP_SET_KEY = 'map-set-1';

/**
 * Creates a map set fixture populated with the provided map keys.
 */
const createMapSet = (maps: string[] = [MAP_KEY]): MapSetModel =>
	buildMapSet(MAP_SET_KEY, {
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

describe('Shared state selector: getMapSetByMapKey', () => {
	it('returns the map set containing the map key', () => {
		const expectedMapSet = createMapSet();
		const fakeState = createFakeState([expectedMapSet]);

		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		expect(result).toBe(expectedMapSet);
	});

	it('returns undefined when map key is not part of any map set', () => {
		const fakeState = createFakeState([createMapSet(['other-map'])]);

		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		expect(result).toBeUndefined();
	});

	it('returns undefined when map sets slice is not an array', () => {
		const baseState = createFakeState();
		const fakeState: AppSharedState = {
			...baseState,
			mapSets: null as unknown as AppSharedState['mapSets'],
		};

		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		expect(result).toBeUndefined();
	});
});
