import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetModeChange } from '../../client/shared/appState/reducerHandlers/mapSetModeChange';
import { ActionMapSetModeChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapSet, makeActionFactory } from '../tools/reducer.helpers';

// Helper: produces map set with configurable visual mode for testing toggles.
const mapSet = (key: string, mode: 'slider' | 'grid' = 'grid') =>
	buildMapSet(key, {
		maps: ['map-a'],
		sync: { center: false, zoom: false },
		view: { latitude: 0, longitude: 0, zoom: 4 },
		mode,
	});

// Helper: assembles fake state containing provided map sets.
const createFakeState = (mapSets: ReturnType<typeof mapSet>[]) => buildAppState({ mapSets });

// Action factory for MAP_SET_MODE_CHANGE with typed payload.
const action = makeActionFactory<ActionMapSetModeChange>(StateActionType.MAP_SET_MODE_CHANGE);

/**
 * Ensures mapSetModeChange toggles display mode per map set key.
 */
describe('Shared state reducer: mapSetModeChange', () => {
	// Scenario: fake state includes two map sets; we switch set-a to slider.
	/**
	 * Confirms the targeted set adopts the requested mode value.
	 */
	it('updates the mode for the targeted map set', () => {
		const fakeState = createFakeState([mapSet('set-a', 'grid'), mapSet('set-b', 'slider')]);

		const result = reduceHandlerMapSetModeChange(fakeState, action({ key: 'set-a', mode: 'slider' }));

		// Targeted set should now report the new mode while peers stay unchanged
		expect(result.mapSets.find((set) => set.key === 'set-a')?.mode).toBe('slider');
		expect(result.mapSets.find((set) => set.key === 'set-b')?.mode).toBe('slider');
	});

	// Scenario: ensure other map sets remain untouched when toggling a different key.
	/**
	 * Checks non-targeted map sets remain unchanged.
	 */
	it('returns other map sets unchanged', () => {
		const fakeState = createFakeState([mapSet('set-a', 'grid'), mapSet('set-b', 'slider')]);

		const result = reduceHandlerMapSetModeChange(fakeState, action({ key: 'set-b', mode: 'grid' }));

		// Untouched set reference should remain identical while target changes mode
		expect(result.mapSets.find((set) => set.key === 'set-a')).toEqual(fakeState.mapSets[0]);
		expect(result.mapSets.find((set) => set.key === 'set-b')?.mode).toBe('grid');
	});
});
