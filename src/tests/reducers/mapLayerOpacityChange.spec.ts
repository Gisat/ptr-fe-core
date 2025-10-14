import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerOpacityChange } from '../../client/shared/appState/reducerHandlers/mapLayerOpacityChange';
import { ActionMapLayerOpacityChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../tools/reducer.helpers';

// Action factory for MAP_LAYER_OPACITY_CHANGE with typed payload.
const action = makeActionFactory<ActionMapLayerOpacityChange>(StateActionType.MAP_LAYER_OPACITY_CHANGE);

/**
 * Validates mapLayerOpacityChange updates layer opacity while leaving others alone.
 */
describe('Shared state reducer: mapLayerOpacityChange', () => {
	// Scenario: fake state has mixed opacities; only urban-footprint should change.
	/**
	 * Checks only the addressed layer receives the new opacity value.
	 */
	it('updates opacity for the targeted layer', () => {
		// Before: overview map has a 0.5 opacity layer we want at 0.75
		const fakeState = buildAppState({
			maps: [
				buildMapModel('overview-map', {
					layers: [
						mapLayerStub({ key: 'urban-footprint', opacity: 0.5 }),
						mapLayerStub({ key: 'surface-water', opacity: 1 }),
					],
				}),
				buildMapModel('detail-map', {
					layers: [mapLayerStub({ key: 'vegetation-index', opacity: 0.25 })],
				}),
			],
		});

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
