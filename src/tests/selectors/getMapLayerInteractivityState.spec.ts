import { getMapLayerInteractivityState } from '../../client/shared/appState/selectors/getMapLayerInteractivityState';
import { AppSharedState } from '../../client/shared/appState/state.models';

const createFakeState = (mapKey = 'mapA', layerKey = 'layerA', isInteractive?: boolean): AppSharedState => ({
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
	mapSets: [],
	maps: [
		{
			key: mapKey,
			view: { zoom: 0, latitude: 0, longitude: 0 },
			renderingLayers: [
				{
					key: layerKey,
					isActive: true,
					isInteractive,
				},
			],
		},
	],
	styles: [],
	periods: [],
	selections: [],
});

describe('Shared state selector: getMapLayerInteractivityState', () => {
	it('returns layer interactivity flag when map and layer exist', () => {
		// Arrange
		const fakeState = createFakeState('mapA', 'layerA', true);

		// Act
		const result = getMapLayerInteractivityState(fakeState, 'mapA', 'layerA');

		// Assert
		expect(result).toBe(true);
	});

	it('returns false when layer interactivity flag is explicitly false', () => {
		// Arrange
		const fakeState = createFakeState('mapA', 'layerA', false);

		// Act
		const result = getMapLayerInteractivityState(fakeState, 'mapA', 'layerA');

		// Assert
		expect(result).toBe(false);
	});

	it('returns undefined when layer is not present on the map', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapLayerInteractivityState(fakeState, 'mapA', 'missing-layer');

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when map is not found', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getMapLayerInteractivityState(fakeState, 'missing-map', 'layerA');

		// Assert
		expect(result).toBeUndefined();
	});
});
