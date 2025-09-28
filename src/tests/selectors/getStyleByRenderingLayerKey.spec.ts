import { getStyleByRenderingLayerKey } from '../../client/shared/appState/selectors/getStyleByRenderingLayerKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const RENDERING_LAYER_KEY = 'n80';
const EXPECTED_STYLE_KEY = 'n8';

const createFakeState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: fullAppSharedStateMock.renderingLayers.map((layer) => ({
		...layer,
		datasource: { ...layer.datasource },
	})),
	layers: fullAppSharedStateMock.layers.map((layer) => ({
		...layer,
		neighbours: layer.neighbours ? [...layer.neighbours] : undefined,
	})),
	styles: fullAppSharedStateMock.styles.map((style) => ({
		...style,
		configuration:
			typeof style.configuration === 'object' && style.configuration !== null
				? { ...style.configuration }
				: style.configuration,
	})),
});

describe('Shared state selector: getStyleByRenderingLayerKey', () => {
	it('returns style linked through layer neighbours', () => {
		// Arrange - fixture links rendering layer n80 -> layer n9 -> style n8
		const fakeState = createFakeState();

		// Act - resolve style for rendering layer
		const result = getStyleByRenderingLayerKey(fakeState, RENDERING_LAYER_KEY);

		// Assert - expect style n8
		expect(result?.key).toBe(EXPECTED_STYLE_KEY);
	});

	it('returns undefined when no style matches neighbours', () => {
		const fakeState = createFakeState();
		fakeState.styles = [];

		const result = getStyleByRenderingLayerKey(fakeState, RENDERING_LAYER_KEY);
		expect(result).toBeUndefined();
	});

	it('returns undefined when key is missing', () => {
		const fakeState = createFakeState();
		const result = getStyleByRenderingLayerKey(fakeState, undefined);
		expect(result).toBeUndefined();
	});
});
