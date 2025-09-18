/**
 * @file Unit tests for the mapLayerSetFeatureKeyInSelections reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerSetFeatureKeyInSelections } from '../../../../client/shared/appState/reducerHandlers/mapLayerSetFeatureKeyInSelections';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

	describe('Reducer test: Map layer set feature key in selections', () => {
		it('creates selection and sets the single featureKey when selectionKey is missing', () => {
			const state = { ...fullAppSharedStateMock, selections: [] };

		const action = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'A1' },
		} as const;

		const result = reduceHandlerSetFeatureKeyInSelections(state, action);

		const mapA = result.maps.find((m) => m.key === 'mapA')!;
		const layer = mapA.renderingLayers.find((l) => l.key === 'n80');
		expect(layer?.selectionKey).toBeDefined();
		const selectionKey = layer?.selectionKey;
		if (!selectionKey) throw new Error('Expected selection key to be created');

		const selection = result.selections.find((s) => s.key === selectionKey)!;
		expect(selection.featureKeys).toEqual(['A1']);
		expect(selection.featureKeyColourIndexPairs['A1']).toBe(0);
	});

	it('overwrites existing selection with the new single featureKey', () => {
			const initial = { ...fullAppSharedStateMock, selections: [] };

		// First set to A1
		const first = reduceHandlerSetFeatureKeyInSelections(initial, {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'A1' },
		} as const);

		const mapA1 = first.maps.find((m) => m.key === 'mapA')!;
		const layer1 = mapA1.renderingLayers.find((l) => l.key === 'n80');
		if (!layer1?.selectionKey) throw new Error('Expected selection key to be created');

		// Then set to B2 (overwrite)
		const second = reduceHandlerSetFeatureKeyInSelections(first, {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'B2' },
		} as const);

		const selection = second.selections.find((s) => s.key === layer1.selectionKey)!;
		expect(selection.featureKeys).toEqual(['B2']);
		expect(selection.featureKeyColourIndexPairs['B2']).toBe(0);
		expect(selection.featureKeyColourIndexPairs['A1']).toBeUndefined();
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'missing', layerKey: 'n80', featureKey: 'X' },
		} as const;
		expect(() => reduceHandlerSetFeatureKeyInSelections(state, action)).toThrow('Map with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		// @ts-expect-error runtime check for missing payload
		expect(() =>
			reduceHandlerSetFeatureKeyInSelections(state, {
				type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			} as const)
		).toThrow('No payload provided for setting featureKey');
	});

	it('throws when layer is not found in target map', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'does-not-exist', featureKey: 'X' },
		} as const;
		expect(() => reduceHandlerSetFeatureKeyInSelections(state, action)).toThrow('No selectionKey found or generated');
	});
});
