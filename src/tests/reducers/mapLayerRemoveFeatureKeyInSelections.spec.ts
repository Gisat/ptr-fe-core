import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveFeatureKeyInSelections } from '../../client/shared/appState/reducerHandlers/mapLayerRemoveFeatureKeyInSelections';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerRemoveFeatureKey } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { Selection } from '../../client/shared/models/models.selections';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Handy layer factory keeps test cases short
const mapLayer = (key: string, selectionKey?: string): Partial<RenderingLayer> => ({
	key,
	isActive: true,
	...(selectionKey ? { selectionKey } : {}),
});

// Local map factory mirrors reducer expectations
const mapModel = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: layers.map((layer) => ({ ...layer })),
});

// Clone just the bits the reducer touches
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

const action = (payload: ActionMapLayerRemoveFeatureKey['payload']): ActionMapLayerRemoveFeatureKey => ({
	type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
	payload,
});

describe('Shared state reducer: mapLayerRemoveFeatureKeyInSelections', () => {
	it('removes the target feature key from the selection', () => {
		const selectionKey = 'selection-urban';
		const fakeState = createFakeState(
			[mapModel('overview-map', [mapLayer('urban-footprint', selectionKey)])],
			[
				{
					key: selectionKey,
					distinctColours: ['#111111'],
					distinctItems: true,
					featureKeys: ['parcel-1', 'parcel-2'],
					featureKeyColourIndexPairs: { 'parcel-1': 0, 'parcel-2': 1 },
				},
			]
		);

		const result = reduceHandlerRemoveFeatureKeyInSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-2' })
		);

		const updatedSelection = result.selections.find((selection) => selection.key === selectionKey);
		expect(updatedSelection?.featureKeys).toEqual(['parcel-1']);
		expect(updatedSelection?.featureKeyColourIndexPairs).toEqual({ 'parcel-1': 0 });
	});

	it('ignores unrelated selections when no selectionKey is present', () => {
		const fakeState = createFakeState(
			[mapModel('overview-map', [mapLayer('urban-footprint')])],
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

		const result = reduceHandlerRemoveFeatureKeyInSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-2' })
		);

		expect(result.selections).toEqual(fakeState.selections);
	});
});
