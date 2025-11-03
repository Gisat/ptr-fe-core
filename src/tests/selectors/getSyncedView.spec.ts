import { getSyncedView } from '../../client/shared/appState/selectors/getSyncedView';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { buildAppState, buildMapSet } from '../tools/reducer.helpers';

/**
 * Map-set key reused across scenarios.
 */
const MAP_SET_KEY = 'map-set-1';

/**
 * Default view values merged into each map-set fixture.
 */
const DEFAULT_VIEW = {
	zoom: 6,
	latitude: 12,
	longitude: 34,
};

type MapSetOverrides = Parameters<typeof buildMapSet>[1];

/**
 * Builds a map-set tailored for synced-view testing.
 */
const createMapSet = (overrides: MapSetOverrides = {}): MapSetModel =>
	buildMapSet(MAP_SET_KEY, {
		sync: { zoom: false, center: false, ...overrides.sync },
		view: { ...DEFAULT_VIEW, ...overrides.view },
		...overrides,
	});

/**
 * Produces app state with the provided map-sets.
 */
const createState = (mapSets: MapSetModel[] = [createMapSet()]): AppSharedState => buildAppState({ mapSets });

describe('Shared state selector: getSyncedView', () => {
	it('returns zoom and center when both are synced', () => {
		// Step 1: Seed state with a map-set syncing both zoom and center.
		const fakeState = createState([
			createMapSet({
				sync: { zoom: true, center: true },
				view: { zoom: 5, latitude: 10, longitude: 20 },
			}),
		]);

		// Step 2: Resolve the synced view for the configured map-set.
		const result = getSyncedView(fakeState, MAP_SET_KEY);

		// Step 3: Confirm both zoom and center are returned.
		expect(result).toEqual({ zoom: 5, latitude: 10, longitude: 20 });
	});

	it('returns only zoom when center is not synced', () => {
		// Step 1: Create state with zoom syncing enabled, center disabled.
		const fakeState = createState([
			createMapSet({
				sync: { zoom: true, center: false },
				view: { zoom: 8, latitude: 1, longitude: 2 },
			}),
		]);

		// Step 2: Ask the selector for the synced view.
		const result = getSyncedView(fakeState, MAP_SET_KEY);

		// Step 3: Expect only the zoom value to be surfaced.
		expect(result).toEqual({ zoom: 8 });
	});

	it('returns empty object when map set not found', () => {
		// Step 1: Provide state without the target map-set.
		const fakeState = createState([]);

		// Step 2: Query the selector using the missing key.
		const result = getSyncedView(fakeState, MAP_SET_KEY);

		// Step 3: Validate that no synced values are returned.
		expect(result).toEqual({});
	});
});
