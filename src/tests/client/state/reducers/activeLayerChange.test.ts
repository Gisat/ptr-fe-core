/**
 * @file Unit tests for the activeLayerChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerActiveLayerChange } from '../../../../client/shared/appState/reducerHandlers/activeLayerChange';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('reduceHandlerActiveLayerChange', () => {
	it('activates the specified rendering layer by datasource key', () => {
		const state = {
			...fullAppSharedStateMock,
			renderingLayers: [
				{
					key: 'n80',
					isActive: false,
					level: 0,
					interaction: null,
					datasource: {
						labels: ['datasource'],
						key: 'n80',
						nameDisplay: '',
						nameInternal: '',
						description: '',
						lastUpdatedAt: 0,
						url: '',
					},
				},
			],
		};

		// Ensure initial value is false for target layer
		const targetKey = 'n80';
		const before = state.renderingLayers.find((l) => l.datasource.key === targetKey);
		expect(before?.isActive).toBe(false);

		const action = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: targetKey, newValue: true },
		};

		const next = reduceHandlerActiveLayerChange(state, action);
		const changed = next.renderingLayers.find((l) => l.datasource.key === targetKey);
		expect(changed?.isActive).toBe(true);
	});

	it('deactivates a previously active rendering layer', () => {
		const state = {
			...fullAppSharedStateMock,
			renderingLayers: [
				{
					key: 'cartoLightNoLabels',
					isActive: true,
					level: 0,
					interaction: null,
					datasource: {
						labels: ['datasource'],
						key: 'cartoLightNoLabels',
						nameDisplay: '',
						nameInternal: '',
						description: '',
						lastUpdatedAt: 0,
						url: '',
					},
				},
			],
		};

		const targetKey = 'cartoLightNoLabels'; // initially active in mock
		const before = state.renderingLayers.find((l) => l.datasource.key === targetKey);
		expect(before?.isActive).toBe(true);

		const action = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: targetKey, newValue: false },
		};

		const next = reduceHandlerActiveLayerChange(state, action);
		const changed = next.renderingLayers.find((l) => l.datasource.key === targetKey);
		expect(changed?.isActive).toBe(false);
	});

	it('throws for an unknown datasource key', () => {
		const state = {
			...fullAppSharedStateMock,
			renderingLayers: [
				{
					key: 'someLayer',
					isActive: false,
					level: 0,
					interaction: null,
					datasource: {
						labels: ['datasource'],
						key: 'someDatasourceKey',
						nameDisplay: '',
						nameInternal: '',
						description: '',
						lastUpdatedAt: 0,
						url: '',
					},
				},
			],
		};
		const action = {
			type: StateActionType.LAYER_ACTIVE_CHANGE,
			payload: { key: 'non-existent', newValue: true },
		};
		expect(() => reduceHandlerActiveLayerChange(state, action)).toThrow(
			'Shared State: Layer with key non-existent not found'
		);
	});
});
