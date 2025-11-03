/**
 * Test suite for selector `getMapViewByKey`.
 *
 * The selector is intentionally defensive: it returns `null` (instead of throwing) when the
 * target map or its `view` object is missing / empty, while emitting `console.warn` messages
 * as a development aid. These tests focus on the return-value contract and do not assert on
 * warnings; doing so keeps tests resilient to future logging changes.
 */
import { getMapViewByKey } from '../../client/shared/appState/selectors/getMapViewByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapView } from '../../client/shared/models/models.mapView';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { buildAppState, buildMapModel } from '../tools/reducer.helpers';

const MAP_KEY = 'map-1';
const DEFAULT_VIEW: MapView = { zoom: 5, latitude: 10, longitude: 20 };

/**
 * Helper: produce a single-map model with an optional view override.
 * Passing `null` explicitly removes the view (rather than leaving it undefined) so the
 * selector's branch handling an absent/empty view is exercised.
 */
const createMap = (view: MapView | null = DEFAULT_VIEW): SingleMapModel => {
	const map = buildMapModel(MAP_KEY, view ? { view } : {});

	return view === null ? ({ ...map, view: null as unknown as MapView } as SingleMapModel) : map;
};

/**
 * Helper: construct a shared state object seeded with the provided map fixtures.
 * Delegates to `buildAppState` to keep test setup concise and consistent; returning the maps
 * slice verbatim ensures selectors receive the structure they expect.
 */
const createFakeState = (maps: SingleMapModel[] = [createMap()]): AppSharedState => {
	const state = buildAppState({ maps });

	return {
		...state,
		maps: state.maps,
	};
};

describe('Shared state selector: getMapViewByKey', () => {
	it('returns the map view when the key matches', () => {
		const fakeState = createFakeState();

		const result = getMapViewByKey(fakeState, MAP_KEY);

		expect(result).toEqual(DEFAULT_VIEW);
	});

	it('returns null when no map matches the key', () => {
		const fakeState = createFakeState([]);

		const result = getMapViewByKey(fakeState, MAP_KEY);

		expect(result).toBeNull();
	});

	it('returns null when the map lacks a view', () => {
		const fakeState = createFakeState([createMap(null)]);

		const result = getMapViewByKey(fakeState, MAP_KEY);

		expect(result).toBeNull();
	});
});
