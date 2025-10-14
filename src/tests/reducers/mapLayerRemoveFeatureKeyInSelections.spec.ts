import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveFeatureKeyInSelections } from '../../client/shared/appState/reducerHandlers/mapLayerRemoveFeatureKeyInSelections';
import { ActionMapLayerRemoveFeatureKey } from '../../client/shared/appState/state.models.actions';
import { Selection } from '../../client/shared/models/models.selections';
import { buildAppState, buildMapModel, makeActionFactory, mapLayerStub } from '../tools/reducer.helpers';

// Helper: fabricates app state with supplied maps and optional selections list.
const buildFakeState = (maps: ReturnType<typeof buildMapModel>[], selections: Selection[] = []) =>
	buildAppState({ maps, selections });

// Action factory for MAP_LAYER_REMOVE_FEATURE_KEY with typed payload.
const action = makeActionFactory<ActionMapLayerRemoveFeatureKey>(StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY);

/**
 * Verifies mapLayerRemoveFeatureKeyInSelections prunes feature keys safely.
 */
describe('Shared state reducer: mapLayerRemoveFeatureKeyInSelections', () => {
	// Scenario: fake state ties selection to urban layer; removing feature should collapse keys/colour map.
	/**
	 * Confirms the addressed feature key is removed and colour mapping shifts.
	 */
	it('removes the target feature key from the selection', () => {
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

		// Run reducer to drop one feature key from the selection
		const result = reduceHandlerRemoveFeatureKeyInSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-2' })
		);

		// Remaining selection should only reference the surviving feature key
		const updatedSelection = result.selections.find((selection) => selection.key === selectionKey);
		expect(updatedSelection?.featureKeys).toEqual(['parcel-1']);
		expect(updatedSelection?.featureKeyColourIndexPairs).toEqual({ 'parcel-1': 0 });
	});

	// Scenario: fake state has no selection key on layer, so reducer should leave selections untouched.
	/**
	 * Ensures reducer bails out when the layer has no selection key.
	 */
	it('ignores unrelated selections when no selectionKey is present', () => {
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

		// Attempt to remove without a selection link should leave state as-is
		const result = reduceHandlerRemoveFeatureKeyInSelections(
			fakeState,
			action({ mapKey: 'overview-map', layerKey: 'urban-footprint', featureKey: 'parcel-2' })
		);

		expect(result.selections).toEqual(fakeState.selections);
	});
});
