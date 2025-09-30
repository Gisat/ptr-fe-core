import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerAddFeatureKeyToSelections } from '../../client/shared/appState/reducerHandlers/mapLayerAddFeatureKeyToSelections';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapLayerAddFeatureKey } from '../../client/shared/appState/state.models.actions';
import { SELECTION_DEFAULT_DISTINCT_COLOURS } from '../../client/shared/constants/colors';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { Selection } from '../../client/shared/models/models.selections';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

// Tiny layer factory keeps scenarios readable
const mapLayer = (key: string, isActive: boolean, selectionKey?: string): Partial<RenderingLayer> => ({
	key,
	isActive,
	...(selectionKey ? { selectionKey } : {}),
});

const mapModel = (key: string, layers: Partial<RenderingLayer>[]): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: layers.map((layer) => ({ ...layer })),
});

// Clone just the bits the reducer cares about, ignore the rest of the shared fixture
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

const action = (payload: ActionMapLayerAddFeatureKey['payload']): ActionMapLayerAddFeatureKey => ({
	type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
	payload,
});

/**
 * Ensures the mapLayerAddFeatureKeyToSelections reducer manages selection metadata.
 */
describe('Shared state reducer: mapLayerAddFeatureKeyToSelections', () => {
	/**
	 * Confirms a selection record is created when the layer lacks one.
	 */
	it('creates a selection entry when the layer had none', () => {
		// Seed maps with layers that currently lack a selection key
		const fakeState = createFakeState([
			mapModel('overview-map', [mapLayer('urban-footprint', true), mapLayer('surface-water', true)]),
			mapModel('detail-map', [mapLayer('vegetation-index', true)]),
		]);

		// Add a feature key which should trigger selection creation
		const result = reduceHandlerAddFeatureKeyToSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-1' })
		);

		// Collect new selection key for assertions
		const updatedOverview = result.maps.find((map) => map.key === 'overview-map');
		const selectionKey = updatedOverview?.renderingLayers.find(
			(layer) => layer.key === 'urban-footprint'
		)?.selectionKey;

		expect(selectionKey).toBeTruthy();
		expect(result.selections).toHaveLength(1);

		const createdSelection = result.selections[0];
		expect(createdSelection.key).toBe(selectionKey);
		expect(createdSelection.featureKeys).toEqual(['parcel-1']);
		expect(createdSelection.featureKeyColourIndexPairs).toEqual({ 'parcel-1': 0 });
		expect(createdSelection.distinctColours).toEqual(SELECTION_DEFAULT_DISTINCT_COLOURS);
		expect(createdSelection.distinctItems).toBe(true);

		// Unaffected maps should stay untouched
		const detailMap = result.maps.find((map) => map.key === 'detail-map');
		expect(detailMap).toEqual(fakeState.maps[1]);
	});

	/**
	 * Ensures existing selections reuse their key and choose the next colour index.
	 */
	it('reuses existing selection keys and assigns the next colour index', () => {
		// Prepare state with an existing selection so reducer can append
		const selectionKey = 'selection-existing';
		const fakeState = createFakeState(
			[mapModel('overview-map', [mapLayer('urban-footprint', true, selectionKey)])],
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

		// Append another feature key to existing selection
		const result = reduceHandlerAddFeatureKeyToSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-2' })
		);

		// Confirm the selection expanded with correct colour index
		const updatedSelection = result.selections.find((selection) => selection.key === selectionKey);
		expect(updatedSelection?.featureKeys).toEqual(['parcel-1', 'parcel-2']);
		expect(updatedSelection?.featureKeyColourIndexPairs['parcel-2']).toBe(1);

		// Layer should continue pointing at the reused key
		const updatedLayer = result.maps[0].renderingLayers.find((layer) => layer.key === 'urban-footprint');
		expect(updatedLayer?.selectionKey).toBe(selectionKey);
	});

	/**
	 * Validates optional selection style overrides flow into the created record.
	 */
	it('applies custom selection style overrides', () => {
		// Build base map requiring a brand-new selection
		const fakeState = createFakeState([mapModel('overview-map', [mapLayer('urban-footprint', true)])]);

		const customStyle: Partial<Selection> = {
			distinctColours: ['#ffffff'],
			distinctItems: false,
		};

		// Add feature key with custom styling to override defaults
		const result = reduceHandlerAddFeatureKeyToSelections(
			fakeState,
			action({
				mapKey: 'overview-map',
				layerKey: 'urban-footprint',
				featureKey: 'parcel-3',
				customSelectionStyle: customStyle,
			})
		);

		// Confirm newly minted selection applies custom colours and flags
		const createdSelection = result.selections[0];
		expect(createdSelection.distinctColours).toEqual(customStyle.distinctColours);
		expect(createdSelection.distinctItems).toBe(false);
		expect(createdSelection.featureKeys).toEqual(['parcel-3']);
		expect(createdSelection.featureKeyColourIndexPairs).toEqual({ 'parcel-3': 0 });
	});
});
