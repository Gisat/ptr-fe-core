import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerRemove } from '../../client/shared/appState/reducerHandlers/mapLayerRemove';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerRemove } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { Selection } from '../../client/shared/models/models.selections';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Keep layer creation compact for readability
const mapLayer = (key: string, isActive: boolean, selectionKey?: string): Partial<RenderingLayer> => ({
	key,
	isActive,
	...(selectionKey ? { selectionKey } : {}),
});

// Local map factory mirrors reducer expectations
const mapModel = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: layers.map((layer) => ({ ...layer })),
});

// Clone only the relevant parts of the shared fixture
const createFakeState = (maps: SingleMapModel[], selections: Selection[] = []): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: [],
	mapSets: [],
	maps: maps.map((map) => ({
		...map,
		view: { ...map.view },
		renderingLayers: map.renderingLayers.map((layer) => ({ ...layer })),
	})),
	selections: selections.map((selection) => ({
		...selection,
		distinctColours: [...selection.distinctColours],
		featureKeys: [...selection.featureKeys],
		featureKeyColourIndexPairs: { ...selection.featureKeyColourIndexPairs },
	})),
});

const action = (payload: ActionMapLayerRemove['payload']): ActionMapLayerRemove => ({
	type: StateActionType.MAP_LAYER_REMOVE,
	payload,
});

/**
 * Validates mapLayerRemove drops layers and cleans up associated selections.
 */
describe('Shared state reducer: mapLayerRemove', () => {
	/**
	 * Confirms both layer and linked selection disappear after removal.
	 */
	it('removes the targeted layer and its selection', () => {
		const selectionKey = 'selection-urban';
		const fakeState = createFakeState(
			[
				mapModel('overview-map', [mapLayer('urban-footprint', true, selectionKey), mapLayer('surface-water', true)]),
				mapModel('detail-map', [mapLayer('vegetation-index', true)]),
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

	/**
	 * Ensures unrelated selections remain when the removed layer had no link.
	 */
	it('keeps selections untouched when the layer had none', () => {
		const fakeState = createFakeState(
			[mapModel('overview-map', [mapLayer('urban-footprint', true)])],
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
