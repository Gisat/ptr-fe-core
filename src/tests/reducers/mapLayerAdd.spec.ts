import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerAdd } from '../../client/shared/appState/reducerHandlers/mapLayerAdd';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerAdd } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Minimal layer stub reused across scenarios
const mapLayer = (key: string, isActive: boolean): Partial<RenderingLayer> => ({ key, isActive });

const mapModel = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
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

const action = (payload: ActionMapLayerAdd['payload']): ActionMapLayerAdd => ({
	type: StateActionType.MAP_LAYER_ADD,
	payload,
});

/**
 * Exercises the mapLayerAdd reducer to ensure it mutates map state correctly.
 */
describe('Shared state reducer: mapLayerAdd', () => {
	/**
	 * Validates that a missing index triggers a simple append to the target map layers.
	 */
	it('appends a new layer to the target map when index is absent', () => {
		// Seed overview and detail maps with their existing layers
		const fakeState = createFakeState([
			mapModel('overview-map', [mapLayer('base-layer', true)]),
			mapModel('detail-map', [mapLayer('surface-water', true)]),
		]);
		const newLayer = mapLayer('vegetation-index', true);

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
		// Start with two layers so the replacement spot is obvious
		const fakeState = createFakeState([
			mapModel('overview-map', [mapLayer('base-layer', true), mapLayer('urban-footprint', false)]),
		]);
		const replacement = mapLayer('nightlights', true);

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
