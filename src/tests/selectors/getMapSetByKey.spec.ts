import { getMapSetByKey } from '../../client/shared/appState/selectors/getMapSetByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';

const MAP_SET_KEY = 'mapSetA';

const defaultMapSet: MapSetModel = {
	key: MAP_SET_KEY,
	maps: ['mapA'],
	sync: { zoom: true, center: true },
	view: {},
};

const createFakeState = (override?: Partial<AppSharedState>): AppSharedState =>
	({
		appNode: {
			key: 'app',
			labels: ['application'],
			nameDisplay: 'app',
			nameInternal: 'app',
			description: '',
			lastUpdatedAt: 0,
		},
		layers: [],
		places: [],
		renderingLayers: [],
		mapSets: [defaultMapSet],
		maps: [],
		styles: [],
		periods: [],
		selections: [],
		...override,
	}) as AppSharedState;

describe('Shared state selector: getMapSetByKey', () => {
	it('returns map set when key matches', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapSetByKey(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toBe(defaultMapSet);
	});

	it('returns undefined when key is unknown', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapSetByKey(fakeState, 'missing-map-set');

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when map sets are missing', () => {
		// Arrange
		const fakeState = createFakeState({ mapSets: undefined as unknown as MapSetModel[] });

		// Act
		const result = getMapSetByKey(fakeState, MAP_SET_KEY);

		// Assert
		expect(result).toBeUndefined();
	});
});
