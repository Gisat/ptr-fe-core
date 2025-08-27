/**
 * @file Unit tests for the globalStateUpdate reducer handler.
 */

import { Datasource } from '../../../../globals/shared/panther/models.nodes';
import { RenderingLayer } from '../../models/models.layers';
import { MapSetModel } from '../../models/models.mapSet';
import { SingleMapModel } from '../../models/models.singleMap';
import { StateActionType } from '../enum.state.actionType';
import { reduceHandlerGlobalStateUpdate } from '../reducerHandlers/globalStateUpdate';
import { ActionGlobalStateUpdate } from '../state.models.actions';
import { createFakeFullState } from '../tests/state.mock';

describe('Reducer test: Global state update', () => {
	/**
	 * Should add new maps, mapSets, and renderingLayers to the state.
	 */

	it('should update state with new maps, mapSets, and renderingLayers', () => {
		const fakeState = createFakeFullState();
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
		const datasource: Datasource = {
			key: 'layer-new',
			nameDisplay: 'Layer New',
			nameInternal: 'Layer New',
			description: '',
			labels: ['datasource'],
			lastUpdatedAt: 0,
			configuration: '{}',
			url: 'https://example.com/layer-new',
		};
		const newLayer: RenderingLayer = {
			key: 'layer-new',
			isActive: false,
			level: 0,
			interaction: null,
			datasource,
		};

		const action: ActionGlobalStateUpdate = {
			type: StateActionType.GLOBAL_STATE_UPDATE,
			payload: {
				maps: [newMap],
				mapSets: [newMapSet],
				renderingLayers: [newLayer],
			},
		};
		const newState = reduceHandlerGlobalStateUpdate(fakeState, action);

		expect(newState.maps.some((m) => m.key === 'map-new')).toBe(true);
		expect(newState.mapSets.some((ms) => ms.key === 'mapSet-new')).toBe(true);
		expect(newState.renderingLayers.some((l) => l.key === 'layer-new')).toBe(true);
	});

	/**
	 * Should throw if no payload is provided.
	 */

	it('should throw if no payload is provided', () => {
		const fakeState = createFakeFullState();
		const action = {
			type: StateActionType.GLOBAL_STATE_UPDATE,
			payload: undefined,
		} as unknown as ActionGlobalStateUpdate;
		expect(() => reduceHandlerGlobalStateUpdate(fakeState, action)).toThrow('No payload provided global state update');
	});
});
