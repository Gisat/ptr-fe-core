import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetAddMapSet } from '../../client/shared/appState/reducerHandlers/mapSetAdd';
import { ActionMapSetAdd } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapSet, makeActionFactory } from '../tools/reducer.helpers';

// Helper: builds fake state populated with the provided map sets.
const createFakeState = (mapSets: ReturnType<typeof mapSet>[] = []) => buildAppState({ mapSets });

const mapSet = (key: string) =>
	buildMapSet(key, {
		maps: ['mapA'],
		sync: { center: true, zoom: true },
		view: { latitude: 0, longitude: 0, zoom: 5 },
	});

// Action factory for MAP_SET_ADD with typed payload.
const action = makeActionFactory<ActionMapSetAdd>(StateActionType.MAP_SET_ADD);

/**
 * Covers mapSetAdd reducer behaviour for adding new map set definitions.
 */
describe('Shared state reducer: mapSetAdd', () => {
	// Scenario: fake state starts with one regional map set; expect new urban set appended.
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

	// Scenario: fake state already contains the map set; reducer should short-circuit to original references.
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
