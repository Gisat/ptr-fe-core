import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetAddMapSet } from '../../client/shared/appState/reducerHandlers/mapSetAdd';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapSetAdd } from '../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Minimal helper to clone the mock and keep tests focused
const createFakeState = (mapSets: MapSetModel[] = []): AppSharedState => ({
	...fullAppSharedStateMock,
	mapSets: mapSets.map((mapSet) => ({
		...mapSet,
		maps: [...mapSet.maps],
		sync: { ...mapSet.sync },
		view: { ...mapSet.view },
	})),
});

const mapSet = (key: string): MapSetModel => ({
	key,
	maps: ['mapA'],
	sync: { center: true, zoom: true },
	view: { latitude: 0, longitude: 0, zoom: 5 },
});

const action = (payload: MapSetModel): ActionMapSetAdd => ({
	type: StateActionType.MAP_SET_ADD,
	payload,
});

/**
 * Covers mapSetAdd reducer behaviour for adding new map set definitions.
 */
describe('Shared state reducer: mapSetAdd', () => {
	/**
	 * Verifies a unique map set payload is appended to state.
	 */
	it('appends a new map set when the key is unique', () => {
		// Before: state has one map set
		const fakeState = createFakeState([mapSet('regional-overview')]);
		const newMapSet = mapSet('urban-detail');

		// After: reducer should add the new map set at the end
		const result = reduceHandlerMapSetAddMapSet(fakeState, action(newMapSet));

		// Expect original entry preserved and new one appended
		expect(result.mapSets).toHaveLength(2);
		expect(result.mapSets[0]).toEqual(fakeState.mapSets[0]);
		expect(result.mapSets[1]).toBe(newMapSet);
	});

	/**
	 * Ensures duplicates short-circuit to the original state reference.
	 */
	it('returns original state when the map set already exists', () => {
		const existing = mapSet('regional-overview');
		const fakeState = createFakeState([existing]);

		const result = reduceHandlerMapSetAddMapSet(fakeState, action(existing));

		// Attempted duplicate should short-circuit with identical references
		expect(result).toBe(fakeState);
		expect(result.mapSets).toBe(fakeState.mapSets);
	});
});
