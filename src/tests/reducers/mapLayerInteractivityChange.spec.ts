import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerInteractivityChange } from '../../client/shared/appState/reducerHandlers/mapLayerInteractivityChange';
import { ActionMapLayerInteractivityChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../tools/reducer.helpers';

const action = makeActionFactory<ActionMapLayerInteractivityChange>(StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE);

/**
 * Exercises the mapLayerInteractivityChange reducer to flip interaction flags.
 */
describe('Shared state reducer: mapLayerInteractivityChange', () => {
	/**
	 * Checks that only the addressed layer switches to interactive=true.
	 */
	it('sets the target layer to interactive', () => {
		// Before: overview map has an interactive=false layer we want to toggle
		const fakeState = buildAppState({
			maps: [
				buildMapModel('overview-map', {
					layers: [
						mapLayerStub({ key: 'urban-footprint', isInteractive: false }),
						mapLayerStub({ key: 'surface-water', isInteractive: true }),
					],
				}),
				buildMapModel('detail-map', {
					layers: [mapLayerStub({ key: 'vegetation-index', isInteractive: true })],
				}),
			],
		});

		// After: reducer should flip isInteractive on the requested layer only
		const result = reduceHandlerMapLayerInteractivityChange(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', isInteractive: true })
		);

		// Confirm targeted layer flips while siblings stay unchanged
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
