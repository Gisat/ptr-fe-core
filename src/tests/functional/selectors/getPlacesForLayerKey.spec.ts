import { getPlacesForLayerKey } from '../../../client/shared/appState/selectors/getPlacesForLayerKey';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { buildAppState, buildRenderingLayer } from '../../tools/reducer.helpers';

/**
 * Layer key used across tests to exercise the happy path.
 */
const LAYER_KEY = 'layer-key';

/**
 * Place keys that simulate datasource neighbours for the target layer.
 */
const PLACE_KEYS = ['place-1', 'place-2'];

/**
 * Builds a minimal place entity suitable for selector tests.
 *
 * @param key Unique key identifying the place.
 * @returns Place object matching the shared-state contract.
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
 * Produces a shared-state snapshot tuned for place-selector testing.
 *
 * @param places Optional set of places to include.
 * @param renderingLayers Optional rendering layers to override neighbour wiring.
 * @returns App state ready for `getPlacesForLayerKey`.
 */
const createState = (
	places = PLACE_KEYS.map(createPlace),
	renderingLayers = [
		buildRenderingLayer('rendering-layer', {
			datasource: { neighbours: [LAYER_KEY, ...PLACE_KEYS] },
		}),
	]
): AppSharedState => ({
	...buildAppState({ renderingLayers }),
	places,
});

describe('Shared state selector: getPlacesForLayerKey', () => {
	it('returns places linked by rendering layer neighbours', () => {
		// Step 1: Create state where the rendering layer references both place keys.
		const fakeState = createState();

		// Step 2: Invoke the selector with the matching layer key.
		const result = getPlacesForLayerKey(fakeState, LAYER_KEY);

		// Step 3: Expect every place from the state to be returned.
		expect(result).toEqual(fakeState.places);
	});

	it('returns empty array when layer key has no neighbours', () => {
		// Step 1: Reuse the default state where only LAYER_KEY links to places.
		const fakeState = createState();

		// Step 2: Query the selector with a non-existent layer key.
		const result = getPlacesForLayerKey(fakeState, 'missing-layer');

		// Step 3: Ensure we safely fall back to an empty array.
		expect(result).toEqual([]);
	});

	it('returns empty array when layer key is null', () => {
		// Step 1: Use the same baseline state to keep the test focused on input validation.
		const fakeState = createState();

		// Step 2: Call the selector with a null key to mimic defensive callers.
		const result = getPlacesForLayerKey(fakeState, null);

		// Step 3: Confirm that null input short-circuits to an empty result set.
		expect(result).toEqual([]);
	});
});
