import { getPlaceByKey } from '../../client/shared/appState/selectors/getPlaceByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { buildAppState } from '../tools/reducer.helpers';

/**
 * Key used across tests to identify the happy-path place.
 */
const PLACE_KEY = 'place-1';

/**
 * Creates a minimal place entity for use in selector tests.
 *
 * @param key Unique identifier for the place.
 * @returns Lightweight place object matching shared-state contracts.
 */
const createPlace = (key: string): AppSharedState['places'][number] => ({
	labels: ['place'],
	key,
	nameDisplay: key,
	nameInternal: key,
	description: '',
	bbox: [0, 0, 1, 1],
	geometry: null,
	lastUpdatedAt: 0,
});

/**
 * Produces an app state tailored for place selector tests.
 *
 * @param places Optional list of places to inject; defaults to a single happy-path place.
 * @returns App state ready for the selector invocation.
 */
const createState = (places = [createPlace(PLACE_KEY)]): AppSharedState => ({
	...buildAppState(),
	places,
});

describe('Shared state selector: getPlaceByKey', () => {
	it('returns place when key matches', () => {
		// Step 1: Prepare state containing the target place.
		const fakeState = createState();

		// Step 2: Invoke selector with the matching key.
		const result = getPlaceByKey(fakeState, PLACE_KEY);

		// Step 3: Confirm the first (and only) place is returned.
		expect(result).toEqual(fakeState.places[0]);
	});

	it('returns undefined when key is unknown', () => {
		// Step 1: Reuse the default state with a single known place.
		const fakeState = createState();

		// Step 2: Query the selector with a non-existent key.
		const result = getPlaceByKey(fakeState, 'missing-place');

		// Step 3: Ensure the selector responds with undefined.
		expect(result).toBeUndefined();
	});
});
