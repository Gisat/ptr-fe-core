import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerActiveChange } from '../../client/shared/appState/reducerHandlers/mapLayerActiveChange';
import { ActionMapLayerActiveChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../tools/reducer.helpers';

const buildFakeState = (maps) => buildAppState({ maps });

const action = makeActionFactory<ActionMapLayerActiveChange>(StateActionType.MAP_LAYER_ACTIVE_CHANGE);

/**
 * Checks the mapLayerActiveChange reducer updates layer activity within a map.
 */
describe('Shared state reducer: mapLayerActiveChange', () => {
	/**
	 * Ensures only the targeted layer on the selected map flips state.
	 */
	it('updates only the targeted layer on the selected map', () => {
		// Set up multiple maps to ensure cross-map isolation
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
