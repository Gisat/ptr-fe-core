import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerActiveChange } from '../../client/shared/appState/reducerHandlers/mapLayerActiveChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerActiveChange } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const baseLayer = (key: string, isActive: boolean): Partial<RenderingLayer> => ({ key, isActive });

const baseMap = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 5 },
	renderingLayers: layers.map((layer) => ({ ...layer })),
});

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

const action = (payload: ActionMapLayerActiveChange['payload']): ActionMapLayerActiveChange => ({
	type: StateActionType.MAP_LAYER_ACTIVE_CHANGE,
	payload,
});

/**
 * Checks the mapLayerActiveChange reducer updates layer activity within a map.
 */
describe('Shared state reducer: mapLayerActiveChange', () => {
	/**
	 * Ensures only the targeted layer on the selected map flips state.
	 */
	it('updates only the targeted layer on the selected map', () => {
		// Set up multiple maps to ensure cross-map isolation
		const fakeState = createFakeState([
			baseMap('overview-map', [baseLayer('vegetation-index', true), baseLayer('urban-footprint', false)]),
			baseMap('detail-map', [baseLayer('surface-water', true)]),
		]);

		// Change activity for a single layer on the overview map
		const result = reduceHandlerMapLayerActiveChange(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', isActive: true })
		);

		// Extract updated references for readability
		const updatedOverview = result.maps.find((map) => map.key === 'overview-map');
		const detailMap = result.maps.find((map) => map.key === 'detail-map');

		// Targeted layer should adopt the new active status
		expect(updatedOverview?.renderingLayers.find((layer) => layer.key === 'urban-footprint')?.isActive).toBe(true);
		// Other layers on the same and other maps should remain untouched
		expect(updatedOverview?.renderingLayers.find((layer) => layer.key === 'vegetation-index')?.isActive).toBe(true);
		expect(detailMap?.renderingLayers.find((layer) => layer.key === 'surface-water')?.isActive).toBe(true);
	});
});
