import { getMapSetMaps } from '../../client/shared/appState/selectors/getMapSetMaps';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';

const MAP_SET_KEY = 'mapSetA';
const MAP_KEYS = ['mapA', 'mapB'];

const createMapSet = (maps: string[]): MapSetModel => ({
	key: MAP_SET_KEY,
	maps,
	sync: { zoom: true, center: true },
	view: {},
});

const createFakeState = (mapSets?: MapSetModel[] | null): AppSharedState =>
	({
		mapSets: mapSets === undefined ? [createMapSet(MAP_KEYS)] : (mapSets as unknown as MapSetModel[]),
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
	}) as unknown as AppSharedState;

describe('Shared state selector: getMapSetMaps', () => {
	it('returns map list for the map set', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapSetMaps(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toEqual(MAP_KEYS);
	});

	it('returns undefined when map set is missing', () => {
		// Arrange
		const fakeState = createFakeState(null);

		// Act
		const result = getMapSetMaps(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toBeUndefined();
	});
});
