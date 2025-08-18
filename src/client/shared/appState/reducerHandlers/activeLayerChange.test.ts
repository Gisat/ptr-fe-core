import { ActionLayerActiveChange } from '../state.models.actions';
import { sharedStateMocks } from '../tests/state.fixture';
import { reduceHandlerActiveLayerChange } from './activeLayerChange';

/**
 * Unit tests for the reduceHandlerActiveLayerChange reducer.
 * This reducer handles activating or deactivating a rendering layer in the shared state.
 */
describe('Reducer test: Change active layer', () => {
	/**
	 * Should activate the specified layer and leave others unchanged.
	 */
	it('should activate the specified layer', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		const action: ActionLayerActiveChange = {
			type: 'LAYER_ACTIVE_CHANGE' as any,
			payload: { key: 'layer-1', newValue: true },
		};

		const newState = reduceHandlerActiveLayerChange(state, action);

		expect(newState.renderingLayers[0].isActive).toBe(true);
		expect(newState.renderingLayers[1].isActive).toBe(false);
	});

	/**
	 * Should deactivate the specified layer after it has been activated.
	 */
	it('should deactivate the specified layer', () => {
		const state = { ...sharedStateMocks.twoLayersFound };
		// First activate, then deactivate
		const activateAction: ActionLayerActiveChange = {
			type: 'LAYER_ACTIVE_CHANGE' as any,
			payload: { key: 'layer-2', newValue: true },
		};
		const activatedState = reduceHandlerActiveLayerChange(state, activateAction);

		const deactivateAction: ActionLayerActiveChange = {
			type: 'LAYER_ACTIVE_CHANGE' as any,
			payload: { key: 'layer-2', newValue: false },
		};
		const deactivatedState = reduceHandlerActiveLayerChange(activatedState, deactivateAction);

		expect(deactivatedState.renderingLayers[1].isActive).toBe(false);
	});

	/**
	 * Should throw an error if the specified layer key does not exist in the state.
	 */
	it('should throw if the layer key does not exist', () => {
		const state = { ...sharedStateMocks.oneLayerMissing };
		const action: ActionLayerActiveChange = {
			type: 'LAYER_ACTIVE_CHANGE' as any,
			payload: { key: 'layer-x', newValue: true },
		};

		expect(() => reduceHandlerActiveLayerChange(state, action)).toThrow(
			'Shared State: Layer with key layer-x not found'
		);
	});
});
