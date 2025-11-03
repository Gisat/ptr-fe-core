import { getMapByKey } from '../../client/shared/appState/selectors/getMapByKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { buildAppState, buildMapModel } from '../tools/reducer.helpers';

const MAP_KEY = 'map-1';

/**
 * Builds a single-map model tailored for map selector tests.
 */
const createMap = (key: string, overrides: Partial<SingleMapModel> = {}): SingleMapModel =>
	buildMapModel(key, overrides);

/**
 * Provides a cloned shared state containing the supplied map models.
 */
const createFakeState = (maps: SingleMapModel[] = [createMap(MAP_KEY)]): AppSharedState => ({
	...buildAppState({ maps }),
	maps,
});

describe('Shared state selector: getMapByKey', () => {
	it('returns the map matching the provided key', () => {
		const expectedMap = createMap(MAP_KEY);
		const fakeState = createFakeState([expectedMap]);

		const result = getMapByKey(fakeState, MAP_KEY);

		expect(result).toBe(expectedMap);
	});

	it('returns undefined when key does not match any map', () => {
		const fakeState = createFakeState();

		const result = getMapByKey(fakeState, 'missing-map');

		expect(result).toBeUndefined();
	});
});
