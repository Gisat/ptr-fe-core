import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerOpacityChange } from '../../client/shared/appState/reducerHandlers/mapLayerOpacityChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerOpacityChange } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Reusable helper so each spec gets a clear layer setup
const mapLayer = (key: string, opacity: number): Partial<RenderingLayer> => ({
	key,
	opacity,
});

// Local map factory mirrors the reducer expectations
const mapModel = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: layers.map((layer) => ({ ...layer })),
});

// Cut down the shared fixture to just what the reducer uses
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

const action = (payload: ActionMapLayerOpacityChange['payload']): ActionMapLayerOpacityChange => ({
	type: StateActionType.MAP_LAYER_OPACITY_CHANGE,
	payload,
});

/**
 * Validates mapLayerOpacityChange updates layer opacity while leaving others alone.
 */
describe('Shared state reducer: mapLayerOpacityChange', () => {
	/**
	 * Checks only the addressed layer receives the new opacity value.
	 */
	it('updates opacity for the targeted layer', () => {
		// Before: overview map has a 0.5 opacity layer we want at 0.75
		const fakeState = createFakeState([
			mapModel('overview-map', [mapLayer('urban-footprint', 0.5), mapLayer('surface-water', 1)]),
			mapModel('detail-map', [mapLayer('vegetation-index', 0.25)]),
		]);

		// After: reducer should only touch the requested layer
		const result = reduceHandlerMapLayerOpacityChange(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', opacity: 0.75 })
		);

		// Confirm opacity changed for the target and not for neighbouring layers
		expect(
			result.maps
				.find((map) => map.key === 'overview-map')
				?.renderingLayers.find((layer) => layer.key === 'urban-footprint')?.opacity
		).toBe(0.75);
		expect(
			result.maps
				.find((map) => map.key === 'overview-map')
				?.renderingLayers.find((layer) => layer.key === 'surface-water')?.opacity
		).toBe(1);
		expect(
			result.maps
				.find((map) => map.key === 'detail-map')
				?.renderingLayers.find((layer) => layer.key === 'vegetation-index')?.opacity
		).toBe(0.25);
	});
});
