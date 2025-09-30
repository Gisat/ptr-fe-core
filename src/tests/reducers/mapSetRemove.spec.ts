import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetRemove } from '../../client/shared/appState/reducerHandlers/mapSetRemove';
import { ActionMapSetRemove } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapSet, makeActionFactory } from '../tools/reducer.helpers';

const mapSet = (key: string) =>
	buildMapSet(key, {
		maps: ['map-a'],
		sync: { center: false, zoom: false },
		view: { latitude: 0, longitude: 0, zoom: 4 },
	});

const createFakeState = (mapSets: ReturnType<typeof mapSet>[]) => buildAppState({ mapSets });

const action = makeActionFactory<ActionMapSetRemove>(StateActionType.MAP_SET_REMOVE);

/**
 * Validates mapSetRemove drops map sets without impacting others.
 */
describe('Shared state reducer: mapSetRemove', () => {
	/**
	 * Ensures the specified map set key is removed from state.
	 */
	it('removes the targeted map set', () => {
		const fakeState = createFakeState([mapSet('set-a'), mapSet('set-b')]);

		const result = reduceHandlerMapSetRemove(fakeState, action({ mapSetKey: 'set-a' }));

		// Remaining keys should exclude the removed set
		expect(result.mapSets.map((set) => set.key)).toEqual(['set-b']);
	});

	/**
	 * Confirms the remaining map sets preserve their references.
	 */
	it('returns other map sets untouched', () => {
		const fakeState = createFakeState([mapSet('set-a'), mapSet('set-b')]);

		const result = reduceHandlerMapSetRemove(fakeState, action({ mapSetKey: 'set-b' }));

		// Survivor map set should be the exact original object
		expect(result.mapSets.find((set) => set.key === 'set-a')).toEqual(fakeState.mapSets[0]);
	});
});
