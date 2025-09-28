import { getMapSetMaps } from '../../client/shared/appState/selectors/getMapSetMaps';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';

const MAP_SET_KEY = 'mapSetA';
const MAP_KEYS = ['mapA', 'mapB'];

const createMapSet = (maps: MapSetModel['maps']): MapSetModel => ({
	key: MAP_SET_KEY,
	maps,
	sync: { zoom: true, center: true },
	view: {},
});

const createFakeState = (mapSets?: MapSetModel[] | null): AppSharedState => ({
	mapSets:
		mapSets === undefined
			? []
			: mapSets === null
				? []
				: mapSets.map((mapSet) => ({ ...mapSet, maps: [...mapSet.maps] })),
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

describe('Shared state selector: getMapSetMaps', () => {
	it('returns map list for the map set', () => {
		// Arrange
		const fakeState = createFakeState([createMapSet(MAP_KEYS)]);

		// Act
		const result = getMapSetMaps(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toEqual(MAP_KEYS);
	});

	it('returns undefined when map set is missing', () => {
		// Arrange
		const fakeState: AppSharedState = createFakeState(null);

		// Act
		const result = getMapSetMaps(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toBeUndefined();
	});
});
