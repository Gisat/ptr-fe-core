import { getMapSetSyncByKey } from '../../../client/shared/appState/selectors/getMapSetSyncByKey';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { MapSetModel } from '../../../client/shared/models/models.mapSet';
import { buildAppState, buildMapSet } from '../../tools/reducer.helpers';

const MAP_SET_KEY = 'map-set-1';

/**
 * Builds a map set fixture that mirrors the reducer helper defaults while letting tests
 * tweak the sync configuration under scrutiny. The helper also seeds a single map reference
 * so the selector receives realistic structure without leaning on the shared fixture.
 */
const createMapSet = (sync: MapSetModel['sync'], key: string = MAP_SET_KEY): MapSetModel =>
	buildMapSet(key, {
		maps: ['map-1'],
		sync,
		view: {},
	});

/**
 * Provides an isolated shared-state clone seeded with supplied map sets.
 * We delegate cloning to `buildAppState` so nested objects (like `sync`) stay independent
 * across test cases. The returned state mirrors what reducers produce in production.
 */
const createFakeState = (mapSets: MapSetModel[] = [createMapSet({ center: false, zoom: true })]): AppSharedState => ({
	...buildAppState({ mapSets }),
	mapSets,
});

describe('Shared state selector: getMapSetSyncByKey', () => {
	it('returns the sync configuration for the matching map set', () => {
		// Arrange: craft a map set where only the center flag is enabled.
		const mapSet = createMapSet({ center: true, zoom: false });
		const fakeState = createFakeState([mapSet]);

		// Act: read the sync definition via the selector.
		const result = getMapSetSyncByKey(fakeState, MAP_SET_KEY);

		// Assert: selector should surface the same sync payload the map set holds.
		expect(result).toEqual(mapSet.sync);
	});

	it('returns undefined when the map set does not exist', () => {
		// Arrange: reuse default state but request an unknown key.
		const fakeState = createFakeState();

		// Act: call with non-existent key.
		const result = getMapSetSyncByKey(fakeState, 'missing-map-set');

		// Assert: selector gracefully reports absence.
		expect(result).toBeUndefined();
	});

	it('returns undefined when there are no map sets', () => {
		// Arrange: empty the map set collection entirely.
		const fakeState = createFakeState([]);

		// Act: ask for the known key even though state is empty.
		const result = getMapSetSyncByKey(fakeState, MAP_SET_KEY);

		// Assert: absence of map sets should yield `undefined`.
		expect(result).toBeUndefined();
	});
});
