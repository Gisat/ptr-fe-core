import { getAllLayers } from '../../client/shared/appState/selectors/getAllLayers';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

describe('Shared state selector: getAllLayers', () => {
	it('returns all layers from state', () => {
		// Arrange
		const fakeState = fullAppSharedStateMock;

		// Act
		const result = getAllLayers(fakeState);

		// Assert
		expect(result).toBe(fakeState.layers);
	});

	it('returns empty array when layers are missing', () => {
		// Arrange
		const fakeState: AppSharedState = {
			...fullAppSharedStateMock,
			layers: [],
		};

		// Act
		const result = getAllLayers(fakeState);

		// Assert
		expect(result).toEqual([]);
	});
});
