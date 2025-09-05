/**
 * @file Unit tests for the activeLayerChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerActiveLayerChange } from '../../../../client/shared/appState/reducerHandlers/activeLayerChange';
import { ActionLayerActiveChange } from '../../../../client/shared/appState/state.models.actions';
import { buildFakeState } from '../../../../client/shared/appState/tests/state.helpers';

describe('changing active state of a rendering layer (array reused, target layer replaced)', () => {
	it('activates the specified layer (array reused, target layer replaced)', () => {
		const fakeState = buildFakeState({ layersPerMap: 2 });
		const originalArrayRef = fakeState.renderingLayers;
		const originalLayer1Ref = fakeState.renderingLayers[0];
		const originalLayer2Ref = fakeState.renderingLayers[1];

		const action: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-1', newValue: true },
		};
		const newState = reduceHandlerActiveLayerChange(fakeState, action);

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
		const fakeState = buildFakeState({ layersPerMap: 2 });

		// Activate layer-2 first
		const activate: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-2', newValue: true },
		};
		const activated = reduceHandlerActiveLayerChange(fakeState, activate);
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
		const fakeState = buildFakeState({ layersPerMap: 2 });
		const originalArrayRef = fakeState.renderingLayers;
		const originalLayer1Ref = fakeState.renderingLayers[0];

		const action: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-1', newValue: false }, // already false
		};
		const newState = reduceHandlerActiveLayerChange(fakeState, action);

		expect(newState.renderingLayers).toBe(originalArrayRef);
		expect(newState.renderingLayers[0]).not.toBe(originalLayer1Ref);
		expect(newState.renderingLayers[0].isActive).toBe(false);
	});
	it('throws when the layer key does not exist', () => {
		const fakeState = buildFakeState({ layersPerMap: 1 });
		const action: ActionLayerActiveChange = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'layer-2', newValue: true },
		};
		expect(() => reduceHandlerActiveLayerChange(fakeState, action)).toThrow(
			'Shared State: Layer with key layer-2 not found'
		);
	});
});
