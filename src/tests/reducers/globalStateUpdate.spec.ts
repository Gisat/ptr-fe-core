import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerGlobalStateUpdate } from '../../client/shared/appState/reducerHandlers/globalStateUpdate';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionGlobalStateUpdate } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { MapSetModel } from '../../client/shared/models/models.mapSet';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const createFakeState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: [],
	mapSets: [],
	maps: [],
});

const layer = (key: string): RenderingLayer => ({
	key,
	isActive: true,
	level: 0,
	interaction: null,
	datasource: {
		key,
		labels: ['datasource'],
		nameDisplay: key,
		nameInternal: key,
		description: `${key} datasource`,
		lastUpdatedAt: 0,
		url: `https://example.com/${key}`,
		configuration: '{}',
	},
});

const mapSet = (key: string): MapSetModel => ({
	key,
	maps: [],
	sync: { center: false, zoom: false },
	view: { latitude: 0, longitude: 0, zoom: 0 },
});

const mapModel = (key: string): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 0 },
	renderingLayers: [],
});

const action = (payload: Partial<ActionGlobalStateUpdate['payload']>): ActionGlobalStateUpdate => ({
	type: StateActionType.GLOBAL_STATE_UPDATE,
	payload: payload as ActionGlobalStateUpdate['payload'],
});

describe('Shared state reducer: globalStateUpdate', () => {
	it('appends state sections and removes duplicates by key', () => {
		const fakeState = {
			...createFakeState(),
			renderingLayers: [layer('vegetation-index')],
			mapSets: [mapSet('regional-overview')],
			maps: [mapModel('overview-map')],
		};

		const result = reduceHandlerGlobalStateUpdate(
			fakeState,
			action({
				renderingLayers: [layer('vegetation-index'), layer('urban-footprint')],
				mapSets: [mapSet('regional-overview'), mapSet('urban-detail')],
				maps: [mapModel('overview-map'), mapModel('detail-map')],
			})
		);

		expect(result.renderingLayers.map((l) => l.key)).toEqual(['vegetation-index', 'urban-footprint']);
		expect(result.mapSets.map((set) => set.key)).toEqual(['regional-overview', 'urban-detail']);
		expect(result.maps.map((map) => map.key)).toEqual(['overview-map', 'detail-map']);
	});

	it('returns original state slices when no payload section provided', () => {
		const state = {
			...createFakeState(),
			renderingLayers: [layer('surface-water')],
			mapSets: [mapSet('hydrology')],
			maps: [mapModel('water-map')],
		};

		const result = reduceHandlerGlobalStateUpdate(state, action({ maps: undefined }));

		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.mapSets).toBe(state.mapSets);
		expect(result.maps).toBe(state.maps);
	});
});
