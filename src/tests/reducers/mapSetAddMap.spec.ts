import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetAddMap } from '../../client/shared/appState/reducerHandlers/mapSetAddMap';
import { ActionMapAddToMapSet } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, buildMapSet, makeActionFactory } from '../tools/reducer.helpers';

// Helper: constructs map set fixture with optional map keys to simulate existing membership.
const mapSet = (key: string, maps: string[] = ['map-a']) =>
	buildMapSet(key, {
		maps,
		sync: { center: false, zoom: false },
		view: { latitude: 0, longitude: 0, zoom: 4 },
	});

// Helper: produces map model with default view/settings for inclusion in state.
const mapModel = (key: string) => buildMapModel(key);

// Helper: assembles fake app state with specified map sets and registered map instances.
const createFakeState = (mapSets: ReturnType<typeof mapSet>[], maps: ReturnType<typeof mapModel>[] = []) =>
	buildAppState({ mapSets, maps });

// Action factory for MAP_ADD_TO_MAP_SET with typed payload.
const action = makeActionFactory<ActionMapAddToMapSet>(StateActionType.MAP_ADD_TO_MAP_SET);

/**
 * Checks mapSetAddMap appends map references and stores the map entity.
 */
describe('Shared state reducer: mapSetAddMap', () => {
	// Scenario: fake state has map set with one member and only that map registered; expect new map appended + stored.
	/**
	 * Ensures the map set gains the new key plus the map record itself.
	 */
	it('appends a new map reference to the target map set and stores the map', () => {
		// Before: map set has one map, state knows about map-a only
		const fakeState = createFakeState([mapSet('regional-overview')], [mapModel('map-a')]);
		const newMap = mapModel('map-b');

		// After: reducer should add the map key to the set and the map to state.maps
		const result = reduceHandlerMapSetAddMap(fakeState, action({ mapSetKey: 'regional-overview', map: newMap }));

		// The set should list the new map, and global map store grows by one
		expect(result.mapSets[0].maps).toEqual(['map-a', 'map-b']);
		expect(result.maps).toHaveLength(fakeState.maps.length + 1);
		expect(result.maps.at(-1)).toBe(newMap);
	});
});
