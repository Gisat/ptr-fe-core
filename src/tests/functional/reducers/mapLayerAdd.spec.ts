import { StateActionType } from '../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerAdd } from '../../../client/shared/appState/reducerHandlers/mapLayerAdd';
import { ActionMapLayerAdd } from '../../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../../tools/reducer.helpers';

// Action factory for MAP_LAYER_ADD with typed payload.
const action = makeActionFactory<ActionMapLayerAdd>(StateActionType.MAP_LAYER_ADD);

/**
 * Exercises the mapLayerAdd reducer to ensure it mutates map state correctly.
 */
describe('Shared state reducer: mapLayerAdd', () => {
	// Scenario: fake state features overview and detail maps; we append a new layer to overview.
	/**
	 * Validates that a missing index triggers a simple append to the target map layers.
	 */
	it('appends a new layer to the target map when index is absent', () => {
		// Fake state: overview map with base layer, detail map with surface layer.
		const fakeState = buildAppState({
			maps: [
				buildMapModel('overview-map', { layers: [mapLayerStub({ key: 'base-layer', isActive: true })] }),
				buildMapModel('detail-map', { layers: [mapLayerStub({ key: 'surface-water', isActive: true })] }),
			],
		});
		const newLayer = mapLayerStub({ key: 'vegetation-index', isActive: true });

		// Invoke reducer with append semantics (no index provided)
		const result = reduceHandlerMapLayerAdd(fakeState, action({ mapKey: 'overview-map', layer: newLayer }));

		// Pull out the affected and unaffected maps for follow-up checks
		const updatedOverview = result.maps.find((map) => map.key === 'overview-map');
		const detailMap = result.maps.find((map) => map.key === 'detail-map');

		expect(updatedOverview?.renderingLayers).toHaveLength(2);
		expect(updatedOverview?.renderingLayers[0]).toEqual({ key: 'base-layer', isActive: true });
		expect(updatedOverview?.renderingLayers[1]).toBe(newLayer);
		// Ensure unrelated maps are left untouched
		expect(detailMap?.renderingLayers).toEqual(fakeState.maps[1].renderingLayers);
	});

	/**
	 * Ensures an explicit index replaces the existing layer rather than appending.
	 */
	it('replaces the layer at the provided index', () => {
		// Fake state: overview map with base layer at index 0 and urban footprint at index 1.
		const fakeState = buildAppState({
			maps: [
				buildMapModel('overview-map', {
					layers: [
						mapLayerStub({ key: 'base-layer', isActive: true }),
						mapLayerStub({ key: 'urban-footprint', isActive: false }),
					],
				}),
			],
		});
		const replacement = mapLayerStub({ key: 'nightlights', isActive: true });

		// Run reducer while supplying the explicit index to target
		const result = reduceHandlerMapLayerAdd(
			fakeState,
			action({ mapKey: 'overview-map', layer: replacement, index: 1 })
		);

		// Capture map state so expectations read clearly
		const updatedOverview = result.maps.find((map) => map.key === 'overview-map');

		expect(updatedOverview?.renderingLayers).toHaveLength(2);
		expect(updatedOverview?.renderingLayers[1]).toBe(replacement);
		expect(updatedOverview?.renderingLayers[0]).toEqual({ key: 'base-layer', isActive: true });
	});
});
