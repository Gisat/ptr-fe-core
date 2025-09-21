import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerInteractivityChange } from '../../client/shared/appState/reducerHandlers/mapLayerInteractivityChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerInteractivityChange } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Keep layer creation concise and readable
const mapLayer = (key: string, isInteractive: boolean): Partial<RenderingLayer> => ({
	key,
	isInteractive,
});

// Local map factory so each scenario starts fresh
const mapModel = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: layers.map((layer) => ({ ...layer })),
});

// Clone only what the reducer touches (maps, rendering layers)
const createFakeState = (maps: SingleMapModel[]): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: [],
	mapSets: [],
	maps: maps.map((map) => ({
		...map,
		view: { ...map.view },
		renderingLayers: map.renderingLayers.map((layer) => ({ ...layer })),
	})),
});

const action = (payload: ActionMapLayerInteractivityChange['payload']): ActionMapLayerInteractivityChange => ({
	type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE,
	payload,
});

describe('Shared state reducer: mapLayerInteractivityChange', () => {
	it('sets the target layer to interactive', () => {
		// Before: overview map has an interactive=false layer we want to toggle
		const fakeState = createFakeState([
			mapModel('overview-map', [mapLayer('urban-footprint', false), mapLayer('surface-water', true)]),
			mapModel('detail-map', [mapLayer('vegetation-index', true)]),
		]);

		// After: reducer should flip isInteractive on the requested layer only
		const result = reduceHandlerMapLayerInteractivityChange(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', isInteractive: true })
		);

		expect(
			result.maps
				.find((map) => map.key === 'overview-map')
				?.renderingLayers.find((layer) => layer.key === 'urban-footprint')?.isInteractive
		).toBe(true);
		expect(
			result.maps
				.find((map) => map.key === 'overview-map')
				?.renderingLayers.find((layer) => layer.key === 'surface-water')?.isInteractive
		).toBe(true);
		expect(
			result.maps
				.find((map) => map.key === 'detail-map')
				?.renderingLayers.find((layer) => layer.key === 'vegetation-index')?.isInteractive
		).toBe(true);
	});
});
