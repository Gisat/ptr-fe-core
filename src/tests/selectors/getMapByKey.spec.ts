import { getMapByKey } from '../../client/shared/appState/selectors/getMapByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

describe('Shared state selector: getMapByKey', () => {
	it('returns map when key matches', () => {
		// Arrange - fixture exposes map "mapA"
		const fakeState = fullAppSharedStateMock;
		const expectedMap = fakeState.maps[0];

		// Act
		const result = getMapByKey(fakeState, expectedMap.key);

		// Assert
		expect(result).toBe(expectedMap);
	});

	it('returns undefined when key is unknown', () => {
		// Arrange
		const fakeState = fullAppSharedStateMock;

		// Act
		const result = getMapByKey(fakeState, 'missing-map');

		// Assert
		expect(result).toBeUndefined();
	});

	it('returns undefined when maps are missing', () => {
		// Arrange
		const fakeState: AppSharedState = {
			...fullAppSharedStateMock,
			maps: [],
		};

		// Act
		const result = getMapByKey(fakeState, 'mapA');

		// Assert
		expect(result).toBeUndefined();
	});
});
