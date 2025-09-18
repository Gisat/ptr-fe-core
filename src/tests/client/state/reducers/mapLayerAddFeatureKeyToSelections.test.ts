/**
 * @file Unit tests for the mapLayerAddFeatureKeyToSelections reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerAddFeatureKeyToSelections } from '../../../../client/shared/appState/reducerHandlers/mapLayerAddFeatureKeyToSelections';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

	describe('Reducer test: Map layer add feature key to selections', () => {
		it('creates selection and assigns selectionKey when missing', () => {
			const state = { ...fullAppSharedStateMock, selections: [] };

		const action = {
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'f-1' },
		} as const;

		const result = reduceHandlerAddFeatureKeyToSelections(state, action);

		const mapA = result.maps.find((m) => m.key === 'mapA')!;
		const layer = mapA.renderingLayers.find((l) => l.key === 'n80');
		expect(layer?.selectionKey).toBeDefined();
		const selectionKey = layer?.selectionKey;
		if (!selectionKey) throw new Error('Expected selection key to be created');

		const selection = result.selections.find((s) => s.key === selectionKey)!;
		expect(selection).toBeTruthy();
		expect(selection.featureKeys).toEqual(['f-1']);
		expect(selection.featureKeyColourIndexPairs['f-1']).toBe(0);
		expect(selection.distinctItems).toBe(true);
		expect(Array.isArray(selection.distinctColours)).toBe(true);
		expect(selection.distinctColours.length).toBeGreaterThan(0);
	});

	it('appends featureKey to existing selection and assigns next color index', () => {
			const initial = { ...fullAppSharedStateMock, selections: [] };

		// First add
		const first = reduceHandlerAddFeatureKeyToSelections(initial, {
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'f-1' },
		} as const);

		const mapA1 = first.maps.find((m) => m.key === 'mapA')!;
		const layer1 = mapA1.renderingLayers.find((l) => l.key === 'n80');
		if (!layer1?.selectionKey) throw new Error('Expected selection key to be created');

		// Second add for same layer
		const second = reduceHandlerAddFeatureKeyToSelections(first, {
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'f-2' },
		} as const);

		const selection = second.selections.find((s) => s.key === layer1.selectionKey)!;
		expect(selection.featureKeys).toEqual(['f-1', 'f-2']);
		expect(selection.featureKeyColourIndexPairs['f-1']).toBe(0);
		expect(selection.featureKeyColourIndexPairs['f-2']).toBe(1);
	});

		it('throws when map is not found', () => {
			const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: { mapKey: 'missing', layerKey: 'n80', featureKey: 'x' },
		} as const;
		expect(() => reduceHandlerAddFeatureKeyToSelections(state, action)).toThrow('Map with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		// @ts-expect-error runtime check for missing payload
		expect(() =>
			reduceHandlerAddFeatureKeyToSelections(state, {
				type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			} as const)
		).toThrow('No payload provided for adding featureKey');
	});

	it('throws when layer is not found in target map', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'does-not-exist', featureKey: 'x' },
		} as const;
		expect(() => reduceHandlerAddFeatureKeyToSelections(state, action)).toThrow('No selectionKey found or generated');
	});
});
