import { StateActionType } from '../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerSetFeatureKeyInSelections } from '../../../client/shared/appState/reducerHandlers/mapLayerSetFeatureKeyInSelections';
import { ActionMapLayerSetFeatureKey } from '../../../client/shared/appState/state.models.actions';
import { Selection } from '../../../client/shared/models/models.selections';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../../tools/reducer.helpers';

// Helper: composes fake state from passed maps and optional selections.
const buildFakeState = (maps: ReturnType<typeof buildMapModel>[], selections: Selection[] = []) =>
	buildAppState({ maps, selections });

// Action factory for MAP_LAYER_SET_FEATURE_KEY with typed payload.
const action = makeActionFactory<ActionMapLayerSetFeatureKey>(StateActionType.MAP_LAYER_SET_FEATURE_KEY);

/**
 * Validates mapLayerSetFeatureKeyInSelections replaces selection feature sets as requested.
 */
describe('Shared state reducer: mapLayerSetFeatureKeyInSelections', () => {
	// Scenario: fake state has selection link; setting new feature should overwrite keys and colour map.
	/**
	 * Ensures the defined selection is overwritten with a single new feature.
	 */
	it('overwrites existing feature keys for the selection', () => {
		const selectionKey = 'selection-urban';
		const fakeState = buildFakeState(
			[
				buildMapModel('overview-map', {
					layers: [mapLayerStub({ key: 'urban-footprint', selectionKey, isActive: true })],
				}),
			],
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

	// Scenario: fake state lacks selection; reducer must create one with defaults.
	/**
	 * Confirms the reducer synthesizes a selection if absent.
	 */
	it('creates a new selection when none existed', () => {
		const fakeState = buildFakeState([
			buildMapModel('overview-map', {
				layers: [mapLayerStub({ key: 'urban-footprint', isActive: true })],
			}),
		]);

		// Creating a selection on the fly should seed defaults
		const result = reduceHandlerSetFeatureKeyInSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-1' })
		);

		const createdSelection = result.selections[0];
		expect(createdSelection.featureKeys).toEqual(['parcel-1']);
		expect(createdSelection.featureKeyColourIndexPairs).toEqual({ 'parcel-1': 0 });
	});

	// Scenario: fake state needs new selection but with custom style overrides applied.
	/**
	 * Verifies optional style overrides flow into the new selection record.
	 */
	it('applies custom selection style overrides', () => {
		const fakeState = buildFakeState([
			buildMapModel('overview-map', {
				layers: [mapLayerStub({ key: 'urban-footprint', isActive: true })],
			}),
		]);

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
