/**
 * Tests for changing sync settings of a map set.
 * Verifies:
 *  - Error when payload missing
 *  - Error when map set not found
 *  - Proper immutable update of targeted map set sync
 *  - Other map sets keep original reference
 *  - Partial sync change merges with existing sync values
 */
import { reduceHandlerMapSetSyncChange } from '../../../../client/shared/appState/reducerHandlers/mapSetSyncChange';
import { AppSharedState } from '../../../../client/shared/appState/state.models';
import { ActionMapSetSyncChange } from '../../../../client/shared/appState/state.models.actions';
import { MapSetModel } from '../../../../client/shared/models/models.mapSet';

// Helper to build a minimal MapSet
const baseMapSet = (overrides: Partial<MapSetModel> = {}): MapSetModel =>
	({
		key: 'mapSet1',
		maps: ['map1', 'map2'],
		view: { zoom: 2, latitude: 0, longitude: 0 },
		sync: { zoom: false, center: false },
		mode: 'grid',
		...overrides,
	}) as any;

// Helper to build AppSharedState
const createState = (overrides: Partial<AppSharedState> = {}): AppSharedState => {
	const state: AppSharedState = {
		appNode: {
			key: 'app',
			nameInternal: 'app',
			nameDisplay: 'App',
			description: null,
			lastUpdatedAt: Date.now(),
			configuration: {},
			labels: [],
		} as any,
		layers: [],
		places: [],
		mapSets: [
			baseMapSet(),
			baseMapSet({ key: 'mapSet2', maps: ['map3'], sync: { zoom: true, center: false }, mode: 'slider' }),
		] as any,
		maps: [
			{ key: 'map1', name: 'Map 1', renderingLayers: [], view: { center: [0, 0], zoom: 3, boxRange: 100 } },
			{ key: 'map2', name: 'Map 2', renderingLayers: [], view: { center: [1, 1], zoom: 4, boxRange: 100 } },
			{ key: 'map3', name: 'Map 3', renderingLayers: [], view: { center: [2, 2], zoom: 5, boxRange: 100 } },
		] as any,
		renderingLayers: [],
		styles: [],
		periods: [],
		selections: [],
		...overrides,
	};
	return state;
};

describe('changing sync settings of a map set', () => {
	it('updates sync for targeted map set immutably', () => {
		const state = createState();
		const originalState = state;
		const originalMapSetsRef = state.mapSets;
		const originalSet1 = state.mapSets[0];
		const originalSet2 = state.mapSets[1];

		const action: ActionMapSetSyncChange = {
			type: 'MAP_SET_SYNC_CHANGE' as any,
			payload: { key: 'mapSet1', syncChange: { zoom: true, center: true } },
		};

		const newState = reduceHandlerMapSetSyncChange(state, action);

		expect(newState).not.toBe(originalState);
		expect(newState.mapSets).not.toBe(originalMapSetsRef);

		const updatedSet1 = newState.mapSets.find((ms: any) => ms.key === 'mapSet1');
		const updatedSet2 = newState.mapSets.find((ms: any) => ms.key === 'mapSet2');

		expect(updatedSet1).not.toBe(originalSet1);
		expect(updatedSet2).toBe(originalSet2);

		expect(updatedSet1?.sync).toEqual({ zoom: true, center: true });
		expect(originalSet1.sync).toEqual({ zoom: false, center: false });
	});

	it('merges partial sync change with existing sync values', () => {
		const state = createState({
			mapSets: [
				baseMapSet({ sync: { zoom: false, center: true } }),
				baseMapSet({ key: 'mapSet2', sync: { zoom: true, center: false } }),
			] as any,
		});
		const originalSet1 = state.mapSets[0];

		const action: ActionMapSetSyncChange = {
			type: 'MAP_SET_SYNC_CHANGE' as any,
			payload: { key: 'mapSet1', syncChange: { zoom: true } },
		};

		const newState = reduceHandlerMapSetSyncChange(state, action);
		const updatedSet1 = newState.mapSets[0];

		expect(updatedSet1).not.toBe(originalSet1);
		expect(updatedSet1.sync).toEqual({ zoom: true, center: true });
	});

	it('throws when map set key does not exist', () => {
		const state = createState();
		const action: ActionMapSetSyncChange = {
			type: 'MAP_SET_SYNC_CHANGE' as any,
			payload: { key: 'unknown', syncChange: { zoom: true } },
		};
		expect(() => reduceHandlerMapSetSyncChange(state, action)).toThrow('MapSet with key unknown not found');
	});

	it('throws when payload is missing', () => {
		const state = createState();
		const action: ActionMapSetSyncChange = {
			type: 'MAP_SET_SYNC_CHANGE' as any,
			payload: undefined,
		} as any;
		expect(() => reduceHandlerMapSetSyncChange(state, action)).toThrow(
			'No payload provided for map set sync change action'
		);
	});
});
