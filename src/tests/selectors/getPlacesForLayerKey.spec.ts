import { getPlacesForLayerKey } from '../../client/shared/appState/selectors/getPlacesForLayerKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const LAYER_KEY = 'n9';

const createFakeState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: fullAppSharedStateMock.renderingLayers.map((layer) => ({
		...layer,
		datasource: { ...layer.datasource },
	})),
	places: fullAppSharedStateMock.places.map((place) => ({ ...place })),
});

describe('Shared state selector: getPlacesForLayerKey', () => {
	it('returns places linked by rendering layer neighbours', () => {
		// Arrange - use fixture where layer n9 is linked to multiple places
		const fakeState = createFakeState();

		// Act - gather places for the layer
		const result = getPlacesForLayerKey(fakeState, LAYER_KEY);

		// Assert - expect all matching places
		expect(result).toEqual(fakeState.places);
	});

	it('returns empty array when layer key has no neighbours', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getPlacesForLayerKey(fakeState, 'missing-layer');

		// Assert
		expect(result).toEqual([]);
	});

	it('returns empty array when layer key is null', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getPlacesForLayerKey(fakeState, null);

		// Assert
		expect(result).toEqual([]);
	});
});
