import { getMapViewByKey } from '../../client/shared/appState/selectors/getMapViewByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapView } from '../../client/shared/models/models.mapView';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';

const MAP_KEY = 'mapA';
const DEFAULT_VIEW: MapView = { zoom: 5, latitude: 10, longitude: 20 };

const createMap = (view?: MapView): SingleMapModel => ({
	key: MAP_KEY,
	view: view as MapView,
	renderingLayers: [],
});

const createFakeState = (maps?: SingleMapModel[]): AppSharedState => ({
	maps: maps ?? [createMap(DEFAULT_VIEW)],
	mapSets: [],
	layers: [],
	places: [],
	renderingLayers: [],
	styles: [],
	periods: [],
	selections: [],
	appNode: {
		key: 'app',
		labels: ['application'],
		nameDisplay: 'app',
		nameInternal: 'app',
		description: '',
		lastUpdatedAt: 0,
	},
});

describe('Shared state selector: getMapViewByKey', () => {
	it('returns map view when key matches', () => {
		// Arrange - build fixture with default map
		const fakeState: AppSharedState = createFakeState();

		// Act - invoke selector
		const result = getMapViewByKey(fakeState, MAP_KEY);

		// Assert - view is returned
		expect(result).toEqual(DEFAULT_VIEW);
	});

	it('returns null when map is missing', () => {
		// Arrange - provide state without maps
		const fakeState: AppSharedState = createFakeState([]);

		// Act
		const result = getMapViewByKey(fakeState, MAP_KEY);

		// Assert - missing map yields null
		expect(result).toBeNull();
	});

	it('returns null when map view is missing', () => {
		// Arrange - map entry without view
		const fakeState = createFakeState([createMap(undefined)]);

		// Act
		const result = getMapViewByKey(fakeState, MAP_KEY);

		// Assert - missing view yields null
		expect(result).toBeNull();
	});
});
