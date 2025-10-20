import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerRemove } from '../../client/shared/appState/reducerHandlers/mapLayerRemove';
import { ActionMapLayerRemove } from '../../client/shared/appState/state.models.actions';
import { Selection } from '../../client/shared/models/models.selections';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../tools/reducer.helpers';

// Helper: composes fake state from provided maps and optional selection entries.
const buildFakeState = (maps: ReturnType<typeof buildMapModel>[], selections: Selection[] = []) =>
	buildAppState({ maps, selections });

// Action factory for MAP_LAYER_REMOVE with typed payload.
const action = makeActionFactory<ActionMapLayerRemove>(StateActionType.MAP_LAYER_REMOVE);

/**
 * Validates mapLayerRemove drops layers and cleans up associated selections.
 */
describe('Shared state reducer: mapLayerRemove', () => {
	// Scenario: fake state includes overview map with selection-linked layer and detail map unaffected.
	/**
	 * Confirms both layer and linked selection disappear after removal.
	 */
	it('removes the targeted layer and its selection', () => {
		const selectionKey = 'selection-urban';
		const fakeState = buildFakeState(
			[
				buildMapModel('overview-map', {
					layers: [
						mapLayerStub({ key: 'urban-footprint', isActive: true, selectionKey }),
						mapLayerStub({ key: 'surface-water', isActive: true }),
					],
				}),
				buildMapModel('detail-map', {
					layers: [mapLayerStub({ key: 'vegetation-index', isActive: true })],
				}),
			],
			[
				{
					key: selectionKey,
					distinctColours: ['#111111', '#222222'],
					distinctItems: true,
					featureKeys: ['parcel-1'],
					featureKeyColourIndexPairs: { 'parcel-1': 0 },
				},
			]
		);

		// Invoke reducer to remove the selected layer and tidy references
		const result = reduceHandlerMapLayerRemove(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint' })
		);

		// Remaining layers should exclude the removed target and selection should vanish
		const overviewLayers = result.maps.find((map) => map.key === 'overview-map')?.renderingLayers;
		expect(overviewLayers?.map((layer) => layer.key)).toEqual(['surface-water']);
		expect(result.selections).toHaveLength(0);

		// Other maps must be unaffected
		const detailMap = result.maps.find((map) => map.key === 'detail-map');
		expect(detailMap).toEqual(fakeState.maps[1]);
	});

	// Scenario: fake state has unrelated selections that must survive when removing a layer without selection key.
	/**
	 * Ensures unrelated selections remain when the removed layer had no link.
	 */
	it('keeps selections untouched when the layer had none', () => {
		const fakeState = buildFakeState(
			[
				buildMapModel('overview-map', {
					layers: [mapLayerStub({ key: 'urban-footprint', isActive: true })],
				}),
			],
			[
				{
					key: 'selection-other',
					distinctColours: ['#ffffff'],
					distinctItems: false,
					featureKeys: ['item'],
					featureKeyColourIndexPairs: { item: 0 },
				},
			]
		);

		// Remove the layer and expect the orphan selection to survive
		const result = reduceHandlerMapLayerRemove(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint' })
		);

		// Map loses the layer but selection bundle remains untouched
		expect(result.maps[0].renderingLayers).toHaveLength(0);
		expect(result.selections).toHaveLength(1);
		expect(result.selections[0].key).toBe('selection-other');
	});
});
