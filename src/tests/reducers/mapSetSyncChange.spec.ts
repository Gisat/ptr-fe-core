import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetSyncChange } from '../../client/shared/appState/reducerHandlers/mapSetSyncChange';
import { ActionMapSetSyncChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapSet, makeActionFactory } from '../tools/reducer.helpers';

// Helper: builds map set fixture with configurable sync flags.
const mapSet = (key: string, sync: { zoom: boolean; center: boolean }) =>
	buildMapSet(key, {
		maps: ['map-a'],
		sync,
		view: { latitude: 0, longitude: 0, zoom: 4 },
	});

// Helper: assembles fake state consisting of supplied map sets.
const createFakeState = (mapSets: ReturnType<typeof mapSet>[]) => buildAppState({ mapSets });

// Action factory for MAP_SET_SYNC_CHANGE with typed payload.
const action = makeActionFactory<ActionMapSetSyncChange>(StateActionType.MAP_SET_SYNC_CHANGE);

/**
 * Validates mapSetSyncChange merges sync flags for the addressed map set.
 */
describe('Shared state reducer: mapSetSyncChange', () => {
	// Scenario: fake state with two map sets; we toggle center sync on set-a only.
	/**
	 * Ensures only the target set receives the sync flag updates.
	 */
	it('merges sync changes into the targeted map set', () => {
		const fakeState = createFakeState([
			mapSet('set-a', { zoom: true, center: true }),
			mapSet('set-b', { zoom: false, center: false }),
		]);

		const result = reduceHandlerMapSetSyncChange(fakeState, action({ key: 'set-a', syncChange: { center: false } }));

		// Targeted set should have mixed flags, others stay untouched
		expect(result.mapSets.find((set) => set.key === 'set-a')?.sync).toEqual({ zoom: true, center: false });
		expect(result.mapSets.find((set) => set.key === 'set-b')?.sync).toEqual({ zoom: false, center: false });
	});
});
