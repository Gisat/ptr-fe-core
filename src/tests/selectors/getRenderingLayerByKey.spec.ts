import { getRenderingLayerByKey } from '../../client/shared/appState/selectors/getRenderingLayerByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const RENDERING_LAYER_KEY = 'n80';

const createFakeState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: fullAppSharedStateMock.renderingLayers.map((layer) => ({
		...layer,
		datasource: { ...layer.datasource },
	})),
	styles: fullAppSharedStateMock.styles.map((style) => ({ ...style })),
});

describe('Shared state selector: getRenderingLayerByKey', () => {
	it('returns rendering layer when key matches', () => {
		// Arrange - clone fixture to allow mutation-free assertions
		const fakeState = createFakeState();

		// Act - select rendering layer
		const result = getRenderingLayerByKey(fakeState, RENDERING_LAYER_KEY);

		// Assert - expect base rendering layer enriched with style configuration
		expect(result).toEqual({
			...fakeState.renderingLayers[0],
			datasource: {
				...fakeState.renderingLayers[0].datasource,
				configuration: fakeState.styles[0].configuration,
			},
		});
	});

	it('returns undefined when key is unknown', () => {
		const fakeState = createFakeState();
		const result = getRenderingLayerByKey(fakeState, 'missing-layer');
		expect(result).toBeUndefined();
	});

	it('returns undefined when key is not provided', () => {
		const fakeState = createFakeState();
		const result = getRenderingLayerByKey(fakeState, undefined);
		expect(result).toBeUndefined();
	});
});
