import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerActiveLayerChange } from '../../client/shared/appState/reducerHandlers/activeLayerChange';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionLayerActiveChange } from '../../client/shared/appState/state.models.actions';
import { buildAppState, buildRenderingLayer, cloneRenderingLayer, makeActionFactory } from '../tools/reducer.helpers';

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

const createAction = makeActionFactory<ActionLayerActiveChange>(StateActionType.LAYER_ACTIVE_CHANGE);

const getLayer = (state: AppSharedState, key: string) => state.renderingLayers.find((layer) => layer.key === key);

/**
 * Verifies that the activeLayerChange reducer toggles a rendering layer's active flag.
 */
describe('Shared state reducer: activeLayerChange', () => {
	/**
	 * Confirms the reducer can switch an inactive layer to active.
	 */
	it('activates the requested rendering layer', () => {
		// Capture baseline so we know the initial inactive status
		const fakeState = buildAppState({ renderingLayers: testRenderingLayers.map(cloneRenderingLayer) });
		expect(getLayer(fakeState, 'urban-footprint')?.isActive).toBe(false);

		// Run reducer requesting activation
		const result = reduceHandlerActiveLayerChange(fakeState, createAction({ key: 'urban-footprint', newValue: true }));
		expect(getLayer(result, 'urban-footprint')?.isActive).toBe(true);
	});

	/**
	 * Ensures the reducer can deactivate an already active layer.
	 */
	it('deactivates the requested rendering layer', () => {
		// Capture baseline so we know the layer starts active
		const fakeState = buildAppState({ renderingLayers: testRenderingLayers.map(cloneRenderingLayer) });
		expect(getLayer(fakeState, 'vegetation-index')?.isActive).toBe(true);

		// Run reducer requesting deactivation
		const result = reduceHandlerActiveLayerChange(
			fakeState,
			createAction({ key: 'vegetation-index', newValue: false })
		);
		expect(getLayer(result, 'vegetation-index')?.isActive).toBe(false);
	});
});
