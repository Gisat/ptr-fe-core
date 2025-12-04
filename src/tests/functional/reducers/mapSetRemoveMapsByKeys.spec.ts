import { StateActionType } from '../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveMapSetMapsByKeys } from '../../../client/shared/appState/reducerHandlers/mapSetRemoveMapsByKeys';
import { ActionMapSetRemoveMapsByKeys } from '../../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, buildMapSet, makeActionFactory } from '../../tools/reducer.helpers';

// Helper: creates map set fixture seeded with specific map keys.
const mapSet = (key: string, maps: string[]) =>
	buildMapSet(key, {
		maps,
		sync: { center: false, zoom: false },
		view: { latitude: 0, longitude: 0, zoom: 4 },
	});

// Helper: builds map model stub for inclusion in map registry.
const mapModel = (key: string) => buildMapModel(key);

// Helper: assembles fake app state with given map sets and map models.
const createFakeState = (mapSets: ReturnType<typeof mapSet>[], maps: ReturnType<typeof mapModel>[]) =>
	buildAppState({ mapSets, maps });

// Action factory for MAP_SET_REMOVE_MAPS_BY_KEYS with typed payload.
const action = makeActionFactory<ActionMapSetRemoveMapsByKeys>(StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS);

/**
 * Verifies mapSetRemoveMapsByKeys prunes maps from a set and global store.
 */
describe('Shared state reducer: mapSetRemoveMapsByKeys', () => {
	// Scenario: fake state has multi-map set; removing subset should prune from both set and registry.
	/**
	 * Ensures specified map keys disappear from both the set and shared map list.
	 */
	it('removes the requested map keys from the map set and maps state', () => {
		const fakeState = createFakeState(
			[mapSet('set-a', ['map-1', 'map-2', 'map-3']), mapSet('set-b', ['map-x'])],
			[mapModel('map-1'), mapModel('map-2'), mapModel('map-3'), mapModel('map-x'), mapModel('map-y')]
		);

		const result = reduceHandlerRemoveMapSetMapsByKeys(
			fakeState,
			action({ mapSetKey: 'set-a', mapKeys: ['map-2', 'map-3'] })
		);

		// Primary set should drop the targeted keys, other sets stay intact, map store prunes matches
		expect(result.mapSets.find((set) => set.key === 'set-a')?.maps).toEqual(['map-1']);
		expect(result.mapSets.find((set) => set.key === 'set-b')?.maps).toEqual(['map-x']);
		expect(result.maps.map((map) => map.key)).toEqual(['map-1', 'map-x', 'map-y']);
	});
});
