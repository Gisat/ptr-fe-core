import { getPlaceByKey } from '../../client/shared/appState/selectors/getPlaceByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const PLACE_KEY = 'n10';

const createFakeState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	places: fullAppSharedStateMock.places.map((place) => ({ ...place })),
});

describe('Shared state selector: getPlaceByKey', () => {
	it('returns place when key matches', () => {
		// Arrange - clone fixture data
		const fakeState = createFakeState();

		// Act - select place
		const result = getPlaceByKey(fakeState, PLACE_KEY);

		// Assert - expect the matching place
		expect(result).toEqual(fakeState.places[0]);
	});

	it('returns undefined when key is unknown', () => {
		// Arrange
		const fakeState = createFakeState();

		// Act
		const result = getPlaceByKey(fakeState, 'missing-place');

		// Assert
		expect(result).toBeUndefined();
	});
});
