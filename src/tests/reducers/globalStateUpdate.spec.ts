import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerGlobalStateUpdate } from '../../client/shared/appState/reducerHandlers/globalStateUpdate';
import { ActionGlobalStateUpdate } from '../../client/shared/appState/state.models.actions';
import {
	buildAppState,
	buildMapModel,
	buildMapSet,
	buildRenderingLayer,
	makeActionFactory,
} from '../tools/reducer.helpers';

const createFakeState = () => buildAppState();

const layer = (key: string) =>
	buildRenderingLayer(key, {
		isActive: true,
	});

const mapSet = (key: string) =>
	buildMapSet(key, {
		maps: [],
		sync: { center: false, zoom: false },
		view: { latitude: 0, longitude: 0, zoom: 0 },
	});

const mapModel = (key: string) =>
	buildMapModel(key, {
		view: { latitude: 0, longitude: 0, zoom: 0 },
	});

const action = makeActionFactory<ActionGlobalStateUpdate, Partial<ActionGlobalStateUpdate['payload']>>(
	StateActionType.GLOBAL_STATE_UPDATE
);

/**
 * Validates the globalStateUpdate reducer merges and preserves global app slices correctly.
 */
describe('Shared state reducer: globalStateUpdate', () => {
	/**
	 * Confirms incoming payload sections add new entities and deduplicate by key.
	 */
	it('appends state sections and removes duplicates by key', () => {
		// Seed state with initial entities to test duplicate handling
		const fakeState = {
			...createFakeState(),
			renderingLayers: [layer('vegetation-index')],
			mapSets: [mapSet('regional-overview')],
			maps: [mapModel('overview-map')],
		};

		// Apply reducer with payload containing duplicates + new keys
		const result = reduceHandlerGlobalStateUpdate(
			fakeState,
			action({
				renderingLayers: [layer('vegetation-index'), layer('urban-footprint')],
				mapSets: [mapSet('regional-overview'), mapSet('urban-detail')],
				maps: [mapModel('overview-map'), mapModel('detail-map')],
			})
		);

		// Ensure only unique keys remain per slice
		expect(result.renderingLayers.map((l) => l.key)).toEqual(['vegetation-index', 'urban-footprint']);
		expect(result.mapSets.map((set) => set.key)).toEqual(['regional-overview', 'urban-detail']);
		expect(result.maps.map((map) => map.key)).toEqual(['overview-map', 'detail-map']);
	});

	/**
	 * Ensures untouched slices are carried by reference when not provided in payload.
	 */
	it('returns original state slices when no payload section provided', () => {
		// Seed state with identifiable references to validate immutability
		const state = {
			...createFakeState(),
			renderingLayers: [layer('surface-water')],
			mapSets: [mapSet('hydrology')],
			maps: [mapModel('water-map')],
		};

		// Run reducer omitting map updates to check reference equality
		const result = reduceHandlerGlobalStateUpdate(state, action({ maps: undefined }));

		// The pre-existing references should pass straight through
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.maps).toBe(state.maps);
	});
});
