import { getPeriodsForLayerKey } from '../../client/shared/appState/selectors/getPeriodsForLayerKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const LAYER_KEY = 'n9';

const createFakeState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: fullAppSharedStateMock.renderingLayers.map((layer) => ({
		...layer,
		datasource: { ...layer.datasource },
	})),
	periods: fullAppSharedStateMock.periods.map((period) => ({ ...period })),
});

describe('Shared state selector: getPeriodsForLayerKey', () => {
	it('returns periods linked by rendering layer neighbours', () => {
		// Arrange - use fixture where n9 is neighbour of rendering layers with period links
		const fakeState = createFakeState();

		// Act - gather periods for the layer
		const result = getPeriodsForLayerKey(fakeState, LAYER_KEY);

		// Assert - expect both linked periods
		expect(result).toEqual([fakeState.periods[0], fakeState.periods[1]]);
	});

	it('returns empty array when layer key has no neighbours', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getPeriodsForLayerKey(fakeState, 'missing-layer');

		// Assert
		expect(result).toEqual([]);
	});

	it('returns empty array when layer key is null', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getPeriodsForLayerKey(fakeState, null);

		// Assert
		expect(result).toEqual([]);
	});
});
