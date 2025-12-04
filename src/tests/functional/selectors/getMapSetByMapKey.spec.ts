import { getMapSetByMapKey } from '../../../client/shared/appState/selectors/getMapSetByMapKey';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { buildAppState, buildMapSet } from '../../tools/reducer.helpers';

/**
 * Map key reused across scenarios.
 */
const MAP_KEY = 'map-1';
/**
 * Map-set key used for the primary fixture.
 */
const MAP_SET_KEY = 'map-set-1';

/**
 * Creates a map set fixture populated with the provided map keys.
 */
const createMapSet = (maps: string[] = [MAP_KEY]) =>
	buildMapSet(MAP_SET_KEY, {
		maps,
		sync: { center: false, zoom: true },
		view: {},
	});

/**
 * Returns a cloned shared state containing the supplied map sets.
 */
const createState = (mapSets = [createMapSet()]): AppSharedState => ({
	...buildAppState({ mapSets }),
	mapSets,
});

describe('Shared state selector: getMapSetByMapKey', () => {
	it('returns the map set containing the map key', () => {
		// Step 1: Seed state containing a map set that references MAP_KEY.
		const expectedMapSet = createMapSet();
		const fakeState = createState([expectedMapSet]);

		// Step 2: Look up the map set containing the map key.
		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		// Step 3: Ensure the selector returns the matching map set instance.
		expect(result).toBe(expectedMapSet);
	});

	it('returns undefined when map key is not part of any map set', () => {
		// Step 1: Provide a state where only unrelated map keys exist.
		const fakeState = createState([createMapSet(['other-map'])]);

		// Step 2: Query selector with the missing map key.
		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		// Step 3: Validate the selector returns undefined for the missing key.
		expect(result).toBeUndefined();
	});

	it('returns undefined when map sets slice is not an array', () => {
		// Step 1: Start from a valid state containing the default map set.
		const baseState = createState();
		const fakeState: AppSharedState = {
			...baseState,
			mapSets: null as unknown as AppSharedState['mapSets'],
		};

		// Step 2: Request the map set using the known key.
		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		// Step 3: Confirm the selector handles invalid mapSets slices gracefully.
		expect(result).toBeUndefined();
	});
});
