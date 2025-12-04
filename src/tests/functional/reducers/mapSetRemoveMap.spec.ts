import { StateActionType } from '../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetRemoveMap } from '../../../client/shared/appState/reducerHandlers/mapSetRemoveMap';
import { ActionMapRemoveFromMapSet } from '../../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, buildMapSet, makeActionFactory } from '../../tools/reducer.helpers';

// Helper: builds map set fixture with provided map keys for removal scenarios.
const mapSet = (key: string, maps: string[]) =>
	buildMapSet(key, {
		maps,
		sync: { center: false, zoom: false },
		view: { latitude: 0, longitude: 0, zoom: 4 },
	});

// Helper: produces map model with default configuration for inclusion in state.
const mapModel = (key: string) => buildMapModel(key);

// Helper: composes fake state using given map sets and registered map models.
const createFakeState = (mapSets: ReturnType<typeof mapSet>[], maps: ReturnType<typeof mapModel>[]) =>
	buildAppState({ mapSets, maps });

// Action factory for MAP_REMOVE_FROM_MAP_SET with typed payload.
const action = makeActionFactory<ActionMapRemoveFromMapSet>(StateActionType.MAP_REMOVE_FROM_MAP_SET);

/**
 * Validates mapSetRemoveMap detaches a map from its set and removes the entity.
 */
describe('Shared state reducer: mapSetRemoveMap', () => {
	// Scenario: fake state contains map-set with two maps and global registry; removing one should prune both lists.
	/**
	 * Ensures both the map set list and global map store drop the targeted map.
	 */
	it('removes the map key from the map set and deletes the map', () => {
		const fakeState = createFakeState(
			[mapSet('set-a', ['map-master', 'map-peer'])],
			[mapModel('map-master'), mapModel('map-peer'), mapModel('map-other')]
		);

		const result = reduceHandlerMapSetRemoveMap(fakeState, action({ mapSetKey: 'set-a', mapKey: 'map-peer' }));

		// Remaining map set should only include the surviving key and map store reflect removal
		expect(result.mapSets[0].maps).toEqual(['map-master']);
		expect(result.maps.map((map) => map.key)).toEqual(['map-master', 'map-other']);
	});
});
