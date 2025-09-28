import { getSyncedView } from '../../client/shared/appState/selectors/getSyncedView';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { MapSetSync } from '../../client/shared/models/models.mapSetSync';

const MAP_SET_KEY = 'mapSetA';

const createMapSet = (sync: MapSetSync, view: MapSetModel['view']): MapSetModel => ({
	key: MAP_SET_KEY,
	maps: [],
	sync,
	view,
});

const createFakeState = (mapSet?: MapSetModel): AppSharedState => ({
	mapSets: mapSet ? [mapSet] : [],
	maps: [],
	layers: [],
	places: [],
	styles: [],
	periods: [],
	selections: [],
	renderingLayers: [],
	appNode: {
		key: 'app',
		labels: ['application'],
		nameDisplay: 'app',
		nameInternal: 'app',
		description: '',
		lastUpdatedAt: 0,
	},
});

describe('Shared state selector: getSyncedView', () => {
	it('returns zoom and center when both are synced', () => {
		// Arrange - map set syncs zoom and center
		const mapSet = createMapSet({ zoom: true, center: true }, { zoom: 5, latitude: 10, longitude: 20 });
		const fakeState = createFakeState(mapSet);

		// Act - compute synced view
		const result = getSyncedView(fakeState, MAP_SET_KEY);

		// Assert - expect all synced parts
		expect(result).toEqual({ zoom: 5, latitude: 10, longitude: 20 });
	});

	it('returns only zoom when center is not synced', () => {
		const mapSet = createMapSet({ zoom: true, center: false }, { zoom: 7 });
		const fakeState = createFakeState(mapSet);
		const result = getSyncedView(fakeState, MAP_SET_KEY);
		expect(result).toEqual({ zoom: 7 });
	});

	it('returns empty object when map set not found', () => {
		const fakeState = createFakeState();
		const result = getSyncedView(fakeState, MAP_SET_KEY);
		expect(result).toEqual({});
	});
});
