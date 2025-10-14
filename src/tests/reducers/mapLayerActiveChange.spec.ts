import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerActiveChange } from '../../client/shared/appState/reducerHandlers/mapLayerActiveChange';
import { ActionMapLayerActiveChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../tools/reducer.helpers';

// Helper: wraps map fixtures into app state with supplied map collection.
const buildFakeState = (maps) => buildAppState({ maps });

// Action factory for MAP_LAYER_ACTIVE_CHANGE with typed payload.
const action = makeActionFactory<ActionMapLayerActiveChange>(StateActionType.MAP_LAYER_ACTIVE_CHANGE);

/**
 * Checks the mapLayerActiveChange reducer updates layer activity within a map.
 */
describe('Shared state reducer: mapLayerActiveChange', () => {
	// Scenario: fake state models two maps—overview with two layers and detail with one—to verify only one layer flips.
	/**
	 * Ensures only the targeted layer on the selected map flips state.
	 */
	it('updates only the targeted layer on the selected map', () => {
		// Fake state: overview map with mixed layer activity and detail map with active surface layer.
		const fakeState = buildFakeState([
			buildMapModel('overview-map', {
				view: { latitude: 0, longitude: 0, zoom: 5 },
				layers: [
					mapLayerStub({ key: 'vegetation-index', isActive: true }),
					mapLayerStub({ key: 'urban-footprint', isActive: false }),
				],
			}),
			buildMapModel('detail-map', {
				view: { latitude: 0, longitude: 0, zoom: 5 },
				layers: [mapLayerStub({ key: 'surface-water', isActive: true })],
			}),
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
