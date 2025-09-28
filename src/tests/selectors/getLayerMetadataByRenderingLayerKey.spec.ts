import { getLayerMetadataByRenderingLayerKey } from '../../client/shared/appState/selectors/getLayerMetadataByRenderingLayerKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

describe('Shared state selector: getLayerMetadataByRenderingLayerKey', () => {
	it('returns metadata for rendering layer neighbours', () => {
		// Arrange - fixture links rendering layer key "n80" to the first layer metadata through neighbours
		const fakeState: AppSharedState = fullAppSharedStateMock;
		const renderingLayerKey = fakeState.renderingLayers[0].key; // "n80"
		const expectedMetadata = fakeState.layers[0]; // First layer metadata that has neighbour n80

		// Act
		const result = getLayerMetadataByRenderingLayerKey(fakeState, renderingLayerKey);

		// Assert
		expect(result).toBe(expectedMetadata);
	});

	it('returns undefined when rendering layer is invalid', () => {
		// Arrange
		const fakeState: AppSharedState = {
			...fullAppSharedStateMock,
			renderingLayers: [],
		};

		// Act
		const result = getLayerMetadataByRenderingLayerKey(fakeState, 'some-unknown-key');

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when key is not provided', () => {
		// Arrange
		const fakeState = fullAppSharedStateMock;

		// Act
		const result = getLayerMetadataByRenderingLayerKey(fakeState, undefined);

		// Assert
		expect(result).toBeUndefined();
	});
});
