/**
 * @file Unit tests for the globalStateUpdate reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerGlobalStateUpdate } from '../../../../client/shared/appState/reducerHandlers/globalStateUpdate';
import { ActionGlobalStateUpdate } from '../../../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../../../client/shared/models/models.layers';
import { MapSetModel } from '../../../../client/shared/models/models.mapSet';
import { SingleMapModel } from '../../../../client/shared/models/models.singleMap';
import type { Datasource } from '../../../../globals/shared/panther/models.nodes';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Global state update', () => {
	it('appends provided maps, mapSets and renderingLayers', () => {
		const state: typeof fullAppSharedStateMock = {
			...fullAppSharedStateMock,
			maps: [] as SingleMapModel[],
			mapSets: [] as MapSetModel[],
			renderingLayers: [] as RenderingLayer[],
		};

		const newMap: SingleMapModel = {
			key: 'map-new',
			renderingLayers: [],
			view: { zoom: 1, latitude: 10, longitude: 10 },
		};
		const newMapSet: MapSetModel = {
			key: 'mapSet-new',
			maps: [],
			view: {},
			sync: { zoom: false, center: false },
		};
		const newLayer: RenderingLayer = {
			key: 'layer-new',
			isActive: false,
			level: 0,
			interaction: null,
			datasource: {
				key: 'layer-new',
				labels: ['datasource'],
				nameDisplay: '',
				nameInternal: '',
				description: '',
				lastUpdatedAt: 0,
				url: '',
				configuration: '{}',
			} as Datasource,
		};

		const action: ActionGlobalStateUpdate = {
			type: StateActionType.GLOBAL_STATE_UPDATE,
			payload: { maps: [newMap], mapSets: [newMapSet], renderingLayers: [newLayer] },
		};

		const result = reduceHandlerGlobalStateUpdate(state, action);
		expect(result.maps).toHaveLength(1);
		expect(result.mapSets).toHaveLength(1);
		expect(result.renderingLayers).toHaveLength(1);
		expect(result.maps[0].key).toBe('map-new');
		expect(result.mapSets[0].key).toBe('mapSet-new');
		expect(result.renderingLayers[0].key).toBe('layer-new');
	});

	it('deduplicates by key when appending', () => {
		const state: typeof fullAppSharedStateMock = {
			...fullAppSharedStateMock,
			maps: [
				{ key: 'map-1', renderingLayers: [], view: { zoom: 1, latitude: 0, longitude: 0 } },
			] as unknown as SingleMapModel[],
			mapSets: [{ key: 'set-1', maps: [], view: {}, sync: { zoom: false, center: false } }] as unknown as MapSetModel[],
			renderingLayers: [
				{
					key: 'layer-1',
					isActive: false,
					level: 0,
					interaction: null,
					datasource: {
						key: 'layer-1',
						labels: ['datasource'],
						nameDisplay: '',
						nameInternal: '',
						description: '',
						lastUpdatedAt: 0,
						url: '',
						configuration: '{}',
					} as Datasource,
				},
			] as unknown as RenderingLayer[],
		};

		const action: ActionGlobalStateUpdate = {
			type: StateActionType.GLOBAL_STATE_UPDATE,
			payload: {
				maps: [
					{ key: 'map-1', renderingLayers: [], view: { zoom: 2, latitude: 0, longitude: 0 } },
					{ key: 'map-2', renderingLayers: [], view: { zoom: 3, latitude: 0, longitude: 0 } },
				],
				mapSets: [
					{ key: 'set-1', maps: [], view: {}, sync: { zoom: true, center: true } },
					{ key: 'set-2', maps: [], view: {}, sync: { zoom: false, center: true } },
				],
				renderingLayers: [
					{
						key: 'layer-1',
						isActive: true,
						level: 1,
						interaction: null,
						datasource: {
							key: 'layer-1',
							labels: ['datasource'],
							nameDisplay: '',
							nameInternal: '',
							description: '',
							lastUpdatedAt: 0,
							url: '',
							configuration: '{}',
						} as Datasource,
					},
					{
						key: 'layer-2',
						isActive: false,
						level: 0,
						interaction: null,
						datasource: {
							key: 'layer-2',
							labels: ['datasource'],
							nameDisplay: '',
							nameInternal: '',
							description: '',
							lastUpdatedAt: 0,
							url: '',
							configuration: '{}',
						} as Datasource,
					},
				],
			},
		};

		const result = reduceHandlerGlobalStateUpdate(state, action);
		expect(result.maps.map((m) => m.key)).toEqual(['map-1', 'map-2']);
		expect(result.mapSets.map((s) => s.key)).toEqual(['set-1', 'set-2']);
		expect(result.renderingLayers.map((l) => l.key)).toEqual(['layer-1', 'layer-2']);
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.GLOBAL_STATE_UPDATE,
			payload: undefined,
		} as unknown as ActionGlobalStateUpdate;
		expect(() => reduceHandlerGlobalStateUpdate(state, action)).toThrow('No payload provided global state update');
	});
});
