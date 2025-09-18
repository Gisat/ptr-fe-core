/**
 * @file Unit tests for the mapLayerRemoveFeatureKeyInSelections reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerRemoveFeatureKeyInSelections } from '../../../../client/shared/appState/reducerHandlers/mapLayerRemoveFeatureKeyInSelections';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Map layer remove feature key in selections', () => {
		it('removes the featureKey from selection and colour index pairs', () => {
			const selections = [
				{
					key: 'sel-1',
				distinctColours: ['#111'],
				distinctItems: true,
				featureKeys: ['f-1', 'f-2'],
				featureKeyColourIndexPairs: { 'f-1': 0, 'f-2': 1 },
			},
			{
				key: 'keep',
				distinctColours: ['#222'],
				distinctItems: true,
				featureKeys: ['x'],
				featureKeyColourIndexPairs: { x: 0 },
				},
			];
			const state = {
				...fullAppSharedStateMock,
			maps: fullAppSharedStateMock.maps.map((m) =>
				m.key === 'mapA'
					? {
							...m,
							renderingLayers: m.renderingLayers.map((l) => (l.key === 'n80' ? { ...l, selectionKey: 'sel-1' } : l)),
						}
					: m
			),
			selections,
		};

		const action = {
			type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'f-2' },
		};

		const result = reduceHandlerRemoveFeatureKeyInSelections(state, action);

		const updated = result.selections.find((s) => s.key === 'sel-1')!;
		expect(updated.featureKeys).toEqual(['f-1']);
		expect(updated.featureKeyColourIndexPairs['f-2']).toBeUndefined();
		expect(updated.featureKeyColourIndexPairs['f-1']).toBe(0);
		// Unrelated selection remains
		expect(result.selections.find((s) => s.key === 'keep')).toBeTruthy();
		// Maps not changed at all
		expect(result.maps).toBe(state.maps);
	});

	it('leaves selections unchanged if target layer has no selectionKey', () => {
		const state = { ...fullAppSharedStateMock, selections: [] };

		const action = {
			type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'f-x' },
		};

		const result = reduceHandlerRemoveFeatureKeyInSelections(state, action);
		expect(result.selections).toEqual(state.selections);
	});

	it('leaves selections unchanged if selectionKey does not match any selection', () => {
		const state = {
			...fullAppSharedStateMock,
			maps: fullAppSharedStateMock.maps.map((m) =>
				m.key === 'mapA'
					? {
							...m,
							renderingLayers: m.renderingLayers.map((l) => (l.key === 'n80' ? { ...l, selectionKey: 'sel-x' } : l)),
						}
					: m
			),
			selections: [
				{
					key: 'different',
					distinctColours: ['#333'],
					distinctItems: true,
					featureKeys: ['z'],
					featureKeyColourIndexPairs: { z: 0 },
				},
			],
		};

		const action = {
			type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'z' },
		};
		const result = reduceHandlerRemoveFeatureKeyInSelections(state, action);
		expect(result.selections).toEqual(state.selections);
	});

	it('throws when map is not found', () => {
			const state = { ...fullAppSharedStateMock };
			const action = {
				type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY,
				payload: { mapKey: 'missing', layerKey: 'n80', featureKey: 'f-x' },
			};
		expect(() => reduceHandlerRemoveFeatureKeyInSelections(state, action)).toThrow('Map with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = JSON.parse('{}');
		action.type = StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY;
		expect(() => reduceHandlerRemoveFeatureKeyInSelections(state, action)).toThrow(
			'No payload provided for removing featureKey'
		);
	});
});
