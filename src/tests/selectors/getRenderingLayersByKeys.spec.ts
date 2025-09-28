import { getRenderingLayerByKey } from '../../client/shared/appState/selectors/getRenderingLayerByKey';
import { getRenderingLayersByKeys } from '../../client/shared/appState/selectors/getRenderingLayersByKeys';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

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
});

describe('Shared state selector: getRenderingLayersByKeys', () => {
	it('returns rendering layers matching provided keys', () => {
		// Arrange - clone fixture for predictable selectors
		const fakeState = createFakeState();
		const keys = ['n80', 'n81'];

		// Act - resolve rendering layers batch
		const result = getRenderingLayersByKeys(fakeState, keys);
		const expected = keys.reduce<RenderingLayer[]>((acc, key) => {
			const layer = getRenderingLayerByKey(fakeState, key);
			if (layer) acc.push(layer);
			return acc;
		}, []);

		// Assert - matches individual selector outputs
		expect(result).toEqual(expected);
	});

	it('skips keys that do not resolve to rendering layers', () => {
		const fakeState = createFakeState();
		const result = getRenderingLayersByKeys(fakeState, ['n80', 'missing-layer']);
		const expected = getRenderingLayerByKey(fakeState, 'n80');
		expect(result).toEqual(expected ? [expected] : []);
	});

	it('returns empty array when no keys provided', () => {
		const fakeState = createFakeState();
		const result = getRenderingLayersByKeys(fakeState, []);
		expect(result).toEqual([]);
	});
});
