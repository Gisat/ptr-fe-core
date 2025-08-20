import { StateActionType } from '../enum.state.actionType';
import { ActionLayerActiveChange } from '../state.models.actions';
import { sharedStateMocks } from '../tests/state.fixture';
import { reduceHandlerActiveLayerChange } from './activeLayerChange';

const freshState = () => structuredClone(sharedStateMocks.twoLayersFound);
const freshMissingState = () => structuredClone(sharedStateMocks.oneLayerMissing);

describe('changing active state of a rendering layer (array reused, target layer replaced)', () => {
	it('activates the specified layer (array reused, target layer replaced)', () => {
		const state = freshState();
		const originalArrayRef = state.renderingLayers;
		const originalLayer1Ref = state.renderingLayers[0];
		const originalLayer2Ref = state.renderingLayers[1];

		const action: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-1', newValue: true },
		};
		const newState = reduceHandlerActiveLayerChange(state, action);

		// Array reused
		expect(newState.renderingLayers).toBe(originalArrayRef);
		// Target layer replaced
		expect(newState.renderingLayers[0]).not.toBe(originalLayer1Ref);
		expect(newState.renderingLayers[0].isActive).toBe(true);
		// Other layer unchanged (same reference)
		expect(newState.renderingLayers[1]).toBe(originalLayer2Ref);
		expect(newState.renderingLayers[1].isActive).toBe(false);
	});

	it('deactivates a previously activated layer (array reused, target layer replaced)', () => {
		const state = freshState();

		// Activate layer-2 first
		const activate: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-2', newValue: true },
		};
		const activated = reduceHandlerActiveLayerChange(state, activate);
		const originalArrayRef = activated.renderingLayers;
		const activatedLayer2Ref = activated.renderingLayers[1];

		// Deactivate
		const deactivate: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-2', newValue: false },
		};
		const deactivated = reduceHandlerActiveLayerChange(activated, deactivate);

		expect(deactivated.renderingLayers).toBe(originalArrayRef);
		expect(deactivated.renderingLayers[1]).not.toBe(activatedLayer2Ref);
		expect(deactivated.renderingLayers[1].isActive).toBe(false);
	});

	it('no-op still replaces the target layer object (array reused)', () => {
		const state = freshState();
		const originalArrayRef = state.renderingLayers;
		const originalLayer1Ref = state.renderingLayers[0];

		const action: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-1', newValue: false }, // already false
		};
		const newState = reduceHandlerActiveLayerChange(state, action);

		expect(newState.renderingLayers).toBe(originalArrayRef);
		expect(newState.renderingLayers[0]).not.toBe(originalLayer1Ref);
		expect(newState.renderingLayers[0].isActive).toBe(false);
	});

	it('throws when the layer key does not exist', () => {
		const state = freshMissingState();
		const action: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-x', newValue: true },
		};
		expect(() => reduceHandlerActiveLayerChange(state, action)).toThrow(
			'Shared State: Layer with key layer-x not found'
		);
	});
});
