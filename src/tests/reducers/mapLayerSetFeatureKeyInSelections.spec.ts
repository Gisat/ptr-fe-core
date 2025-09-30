import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerSetFeatureKeyInSelections } from '../../client/shared/appState/reducerHandlers/mapLayerSetFeatureKeyInSelections';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerSetFeatureKey } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { Selection } from '../../client/shared/models/models.selections';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Lightweight helpers to keep each scenario focused
const mapLayer = (key: string, selectionKey?: string): Partial<RenderingLayer> => ({
	key,
	isActive: true,
	...(selectionKey ? { selectionKey } : {}),
});

const mapModel = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: layers.map((layer) => ({ ...layer })),
});

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

const action = (payload: ActionMapLayerSetFeatureKey['payload']): ActionMapLayerSetFeatureKey => ({
	type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
	payload,
});

/**
 * Validates mapLayerSetFeatureKeyInSelections replaces selection feature sets as requested.
 */
describe('Shared state reducer: mapLayerSetFeatureKeyInSelections', () => {
	/**
	 * Ensures the defined selection is overwritten with a single new feature.
	 */
	it('overwrites existing feature keys for the selection', () => {
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

		// Replace feature keys and colour mapping with the new entry
		const result = reduceHandlerSetFeatureKeyInSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-3' })
		);

		// Old keys should be dropped in favour of the latest selection
		const updatedSelection = result.selections.find((selection) => selection.key === selectionKey);
		expect(updatedSelection?.featureKeys).toEqual(['parcel-3']);
		expect(updatedSelection?.featureKeyColourIndexPairs).toEqual({ 'parcel-3': 0 });
	});

	/**
	 * Confirms the reducer synthesizes a selection if absent.
	 */
	it('creates a new selection when none existed', () => {
		const fakeState = createFakeState([mapModel('overview-map', [mapLayer('urban-footprint')])]);

		// Creating a selection on the fly should seed defaults
		const result = reduceHandlerSetFeatureKeyInSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-1' })
		);

		const createdSelection = result.selections[0];
		expect(createdSelection.featureKeys).toEqual(['parcel-1']);
		expect(createdSelection.featureKeyColourIndexPairs).toEqual({ 'parcel-1': 0 });
	});

	/**
	 * Verifies optional style overrides flow into the new selection record.
	 */
	it('applies custom selection style overrides', () => {
		const fakeState = createFakeState([mapModel('overview-map', [mapLayer('urban-footprint')])]);

		// Provide custom styling when setting the feature key
		const result = reduceHandlerSetFeatureKeyInSelections(
			fakeState,
			action({
				mapKey: 'overview-map',
				layerKey: 'urban-footprint',
				featureKey: 'parcel-custom',
				customSelectionStyle: {
					distinctColours: ['#ffffff'],
					distinctItems: false,
				},
			})
		);

		// The generated selection should honour custom settings and new feature key
		const createdSelection = result.selections[0];
		expect(createdSelection.distinctColours).toEqual(['#ffffff']);
		expect(createdSelection.distinctItems).toBe(false);
		expect(createdSelection.featureKeys).toEqual(['parcel-custom']);
		expect(createdSelection.featureKeyColourIndexPairs).toEqual({ 'parcel-custom': 0 });
	});
});
