import { getLayersByMapKey } from '../../client/shared/appState/selectors/getLayersByMapKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

describe('Shared state selector: getLayersByMapKey', () => {
	it('merges rendering layer details with map layers', () => {
		// Arrange - fixture map "mapA" links to rendering layer metadata for key "n80"
		const fakeState = fullAppSharedStateMock;
		const map = fakeState.maps[0];

		// Act
		const result = getLayersByMapKey(fakeState, map.key);

		// Assert
		expect(result).toBeDefined();
		expect(result).toHaveLength(map.renderingLayers.length);
		const mergedLayer = result?.find((layer) => layer.key === 'n80');
		expect(mergedLayer?.datasource?.key).toBe('n80');
		expect(mergedLayer?.isActive).toBe(true);
		expect(mergedLayer?.level).toBe(0);
	});

	it('returns undefined when map key is unknown', () => {
		// Arrange
		const fakeState = fullAppSharedStateMock;

		// Act
		const result = getLayersByMapKey(fakeState, 'unknown-map');

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when rendering layers are missing', () => {
		// Arrange
		const mapKey = fullAppSharedStateMock.maps[0].key;
		const fakeState = {
			...fullAppSharedStateMock,
			renderingLayers: [],
		} as AppSharedState;

		// Act
		const result = getLayersByMapKey(fakeState, mapKey);

		// Assert
		expect(result).toBeUndefined();
	});
});
