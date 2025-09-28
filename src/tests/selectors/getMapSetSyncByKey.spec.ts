import { getMapSetSyncByKey } from '../../client/shared/appState/selectors/getMapSetSyncByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { MapSetSync } from '../../client/shared/models/models.mapSetSync';

const MAP_SET_KEY = 'mapSetA';
const SYNC: MapSetSync = { zoom: true, center: false };

const createMapSet = (sync: MapSetSync): MapSetModel => ({
	key: MAP_SET_KEY,
	maps: ['mapA'],
	sync,
	view: {},
});

const createFakeState = (mapSets?: MapSetModel[] | undefined): AppSharedState => ({
	mapSets: mapSets === undefined ? [createMapSet(SYNC)] : mapSets,
	maps: [],
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

describe('Shared state selector: getMapSetSyncByKey', () => {
	it('returns sync settings when key matches', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapSetSyncByKey(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toEqual(SYNC);
	});

	it('returns undefined when key is unknown', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapSetSyncByKey(fakeState, 'missing-map-set');

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when map sets are missing', () => {
		// Arrange
		const fakeState = createFakeState([]);

		// Act
		const result = getMapSetSyncByKey(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toBeUndefined();
	});
});
