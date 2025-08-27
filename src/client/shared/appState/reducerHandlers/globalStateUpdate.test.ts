import { reduceHandlerGlobalStateUpdate } from '../reducerHandlers/globalStateUpdate';
import { ActionGlobalStateUpdate } from '../state.models.actions';
import { sharedStateMocks } from '../tests/state.fixture';

describe('Reducer test: Global state update', () => {
	/**
	 * Should add new maps, mapSets, and renderingLayers to the state.
	 */
	it('should update state with new maps, mapSets, and renderingLayers', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const newMap = {
			key: 'map-new',
			renderingLayers: [],
			view: { zoom: 1, latitude: 10, longitude: 10 },
		};
		const newMapSet = {
			key: 'mapSet-new',
			maps: [],
			name: 'New MapSet',
		};
		const newLayer = {
			key: 'layer-new',
			isActive: false,
			level: 0,
			interaction: null,
			datasource: {
				key: 'layer-new',
				nameDisplay: 'Layer New',
				nameInternal: 'Layer New',
				description: '',
				labels: ['datasource'],
				lastUpdatedAt: 123456,
				configuration: '{}',
			},
		};

		const action: ActionGlobalStateUpdate = {
			type: 'GLOBAL_STATE_UPDATE' as any,
			payload: {
				maps: [newMap],
				mapSets: [newMapSet],
				renderingLayers: [newLayer],
			},
		};

		const newState = reduceHandlerGlobalStateUpdate(state, action);

		expect(newState.maps.some((m) => m.key === 'map-new')).toBe(true);
		expect(newState.mapSets.some((ms) => ms.key === 'mapSet-new')).toBe(true);
		expect(newState.renderingLayers.some((l) => l.key === 'layer-new')).toBe(true);
	});

	/**
	 * Should throw if no payload is provided.
	 */
	it('should throw if no payload is provided', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action = {
			type: 'GLOBAL_STATE_UPDATE' as any,
			payload: undefined,
		} as any;

		expect(() => reduceHandlerGlobalStateUpdate(state, action)).toThrow('No payload provided global state update');
	});
});
