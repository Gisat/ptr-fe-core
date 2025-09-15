/**
 * @file Unit tests for the globalStateUpdate reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerGlobalStateUpdate } from '../../../../client/shared/appState/reducerHandlers/globalStateUpdate';
import { ActionGlobalStateUpdate } from '../../../../client/shared/appState/state.models.actions';
// Local minimal types to decouple tests from production models
type TestRenderingLayer = {
  key: string;
  isActive: boolean;
  level: number;
  interaction: null;
  datasource: {
    key: string;
    labels: string[];
    nameDisplay: string;
    nameInternal: string;
    description: string | null | '';
    lastUpdatedAt: number;
    url: string;
    configuration: string;
  };
};
type TestMapSet = {
  key: string;
  maps: string[];
  view: Record<string, unknown>;
  sync: { zoom: boolean; center: boolean };
};
type TestSingleMap = {
  key: string;
  renderingLayers: Array<{ key: string; isActive?: boolean }>;
  view: { zoom: number; latitude: number; longitude: number };
};
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Global state update', () => {
	it('appends provided maps, mapSets and renderingLayers', () => {
		const state: typeof fullAppSharedStateMock = {
			...fullAppSharedStateMock,
        maps: [] as TestSingleMap[],
        mapSets: [] as TestMapSet[],
        renderingLayers: [] as TestRenderingLayer[],
		};

        const newMap: TestSingleMap = {
			key: 'map-new',
			renderingLayers: [],
			view: { zoom: 1, latitude: 10, longitude: 10 },
		};
        const newMapSet: TestMapSet = {
			key: 'mapSet-new',
			maps: [],
			view: {},
			sync: { zoom: false, center: false },
		};
        const newLayer: TestRenderingLayer = {
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
        const state: typeof fullAppSharedStateMock = {
            ...fullAppSharedStateMock,
            maps: [
                { key: 'map-1', renderingLayers: [], view: { zoom: 1, latitude: 0, longitude: 0 } },
            ] as unknown as TestSingleMap[],
            mapSets: [{ key: 'set-1', maps: [], view: {}, sync: { zoom: false, center: false } }] as unknown as TestMapSet[],
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
            ] as unknown as TestRenderingLayer[],
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

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.GLOBAL_STATE_UPDATE,
			payload: undefined,
		} as unknown as ActionGlobalStateUpdate;
		expect(() => reduceHandlerGlobalStateUpdate(state, action)).toThrow('No payload provided global state update');
	});
});
