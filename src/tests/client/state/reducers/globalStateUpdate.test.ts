/**
 * @file Unit tests for the globalStateUpdate reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerGlobalStateUpdate } from '../../../../client/shared/appState/reducerHandlers/globalStateUpdate';
import { ActionGlobalStateUpdate } from '../../../../client/shared/appState/state.models.actions';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Global state update', () => {
	it('appends provided maps, mapSets and renderingLayers', () => {
		const state = {
			...fullAppSharedStateMock,
			maps: [],
			mapSets: [],
			renderingLayers: [],
		};

		const newMap = {
			key: 'map-new',
			renderingLayers: [],
			view: { zoom: 1, latitude: 10, longitude: 10 },
		};
		const newMapSet = {
			key: 'mapSet-new',
			maps: [],
			view: {},
			sync: { zoom: false, center: false },
		};
		const newLayer = {
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
			},
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
		const state = {
			...fullAppSharedStateMock,
			maps: [{ key: 'map-1', renderingLayers: [], view: { zoom: 1, latitude: 0, longitude: 0 } }],
			mapSets: [{ key: 'set-1', maps: [], view: {}, sync: { zoom: false, center: false } }],
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
					},
				},
			],
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
						},
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
						},
					},
				],
			},
		};

		const result = reduceHandlerGlobalStateUpdate(state, action);
		expect(result.maps.map((m) => m.key)).toEqual(['map-1', 'map-2']);
		expect(result.mapSets.map((s) => s.key)).toEqual(['set-1', 'set-2']);
		expect(result.renderingLayers.map((l) => l.key)).toEqual(['layer-1', 'layer-2']);
	});

	it('throws error when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const invalidAction = { type: StateActionType.GLOBAL_STATE_UPDATE } as unknown as ActionGlobalStateUpdate;
		expect(() => reduceHandlerGlobalStateUpdate(state, invalidAction)).toThrow(
			'No payload provided global state update'
		);
	});
});
