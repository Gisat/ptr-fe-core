import { getMapSetByMapKey } from '../../client/shared/appState/selectors/getMapSetByMapKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';

const MAP_KEY = 'mapA';
const MAP_SET_KEY = 'mapSetA';

const createMapSet = (maps: string[]): MapSetModel => ({
	key: MAP_SET_KEY,
	maps,
	sync: { zoom: true, center: true },
	view: {},
});

const createFakeState = (mapSets?: MapSetModel[]): AppSharedState => ({
	maps: [],
	mapSets: mapSets === undefined ? [createMapSet([MAP_KEY])] : (mapSets as MapSetModel[]),
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

describe('Shared state selector: getMapSetByMapKey', () => {
	it('returns map set containing the map key', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		// Assert
		expect(result?.key).toBe(MAP_SET_KEY);
	});

	it('returns undefined when no map set contains the map key', () => {
		// Arrange
		const fakeState = createFakeState([createMapSet(['mapB'])]);

		// Act
		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when map sets are missing', () => {
		// Arrange
		const fakeState = createFakeState(null as unknown as MapSetModel[]);

		// Act
		const result = getMapSetByMapKey(fakeState, MAP_KEY);

		// Assert
		expect(result).toBeUndefined();
	});
});
