import { StateActionType } from '../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerActiveLayerChange } from '../../../client/shared/appState/reducerHandlers/activeLayerChange';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { ActionLayerActiveChange } from '../../../client/shared/appState/state.models.actions';
import {
	buildAppState,
	buildRenderingLayer,
	cloneRenderingLayer,
	makeActionFactory,
} from '../../tools/reducer.helpers';

// Test fixture: two rendering layers where only vegetation is active to mimic baseline app state.

const testRenderingLayers = [
	{
		...buildRenderingLayer('vegetation-index', {
			isActive: true,
			datasource: {
				nameDisplay: 'Vegetation Index',
				nameInternal: 'Vegetation Index',
				description: 'NDVI overview',
				url: 'https://example.com/vegetation-index',
			},
		}),
	},
	{
		...buildRenderingLayer('urban-footprint', {
			isActive: false,
			datasource: {
				nameDisplay: 'Urban Footprint',
				nameInternal: 'Urban Footprint',
				description: 'Built-up areas',
				url: 'https://example.com/urban-footprint',
			},
		}),
	},
];

// Helper factory to build LAYER_ACTIVE_CHANGE actions with typed payloads.
const createAction = makeActionFactory<ActionLayerActiveChange>(StateActionType.LAYER_ACTIVE_CHANGE);

// Selector helper so tests can read a layer by key without duplicating search logic.
const getLayer = (state: AppSharedState, key: string) => state.renderingLayers.find((layer) => layer.key === key);

/**
 * Verifies that the activeLayerChange reducer toggles a rendering layer's active flag.
 */
describe('Shared state reducer: activeLayerChange', () => {
	// Scenario: start with vegetation active and urban inactive to validate activating a dormant layer.
	/**
	 * Confirms the reducer can switch an inactive layer to active.
	 */
	it('activates the requested rendering layer', () => {
		// Fake state: start with vegetation active, urban inactive before the change.
		const fakeState = buildAppState({ renderingLayers: testRenderingLayers.map(cloneRenderingLayer) });
		// Assert baseline expectation before reducer runs.
		expect(getLayer(fakeState, 'urban-footprint')?.isActive).toBe(false);

		// Run reducer requesting activation
		const result = reduceHandlerActiveLayerChange(fakeState, createAction({ key: 'urban-footprint', newValue: true }));
		// Verify reducer marks the layer active.
		expect(getLayer(result, 'urban-footprint')?.isActive).toBe(true);
	});

	// Scenario: state mirrors baseline but we target turning off the active vegetation layer.
	/**
	 * Ensures the reducer can deactivate an already active layer.
	 */
	it('deactivates the requested rendering layer', () => {
		// Fake state: start with vegetation active, urban inactive before the change.
		const fakeState = buildAppState({ renderingLayers: testRenderingLayers.map(cloneRenderingLayer) });
		// Assert baseline expectation before reducer runs.
		expect(getLayer(fakeState, 'vegetation-index')?.isActive).toBe(true);

		// Run reducer requesting deactivation
		const result = reduceHandlerActiveLayerChange(
			fakeState,
			createAction({ key: 'vegetation-index', newValue: false })
		);
		// Verify reducer marks the layer inactive.
		expect(getLayer(result, 'vegetation-index')?.isActive).toBe(false);
	});
});
