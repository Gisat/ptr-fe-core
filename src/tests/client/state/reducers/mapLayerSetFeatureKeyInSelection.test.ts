/**
 * @file Unit tests for the mapLayerSetFeatureKeyInSelections reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerSetFeatureKeyInSelections } from '../../../../client/shared/appState/reducerHandlers/mapLayerSetFeatureKeyInSelections';
import { ActionMapLayerSetFeatureKey } from '../../../../client/shared/appState/state.models.actions';
// Local minimal type to avoid coupling tests to production types
type TestSelection = {
  key: string;
  distinctColours: string[];
  distinctItems: boolean;
  featureKeys: Array<string | number>;
  featureKeyColourIndexPairs: Record<string, number>;
};
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Map layer set feature key in selections', () => {
	it('creates selection and sets the single featureKey when selectionKey is missing', () => {
    const state = { ...fullAppSharedStateMock, selections: [] as TestSelection[] };

		const action: ActionMapLayerSetFeatureKey = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'A1' },
		};

		const result = reduceHandlerSetFeatureKeyInSelections(state, action);

		const mapA = result.maps.find((m) => m.key === 'mapA')!;
		const layer = mapA.renderingLayers.find((l) => l.key === 'n80') as { selectionKey?: string };
		expect(typeof layer.selectionKey).toBe('string');
		expect(layer.selectionKey && layer.selectionKey.length).toBeGreaterThan(0);

		const selection = result.selections.find((s) => s.key === layer.selectionKey)!;
		expect(selection.featureKeys).toEqual(['A1']);
		expect(selection.featureKeyColourIndexPairs['A1']).toBe(0);
	});

	it('overwrites existing selection with the new single featureKey', () => {
    const initial = { ...fullAppSharedStateMock, selections: [] as TestSelection[] };

		// First set to A1
		const first = reduceHandlerSetFeatureKeyInSelections(initial, {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'A1' },
		});

		const mapA1 = first.maps.find((m) => m.key === 'mapA')!;
		const layer1 = mapA1.renderingLayers.find((l) => l.key === 'n80') as { selectionKey?: string };

		// Then set to B2 (overwrite)
		const second = reduceHandlerSetFeatureKeyInSelections(first, {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'n80', featureKey: 'B2' },
		});

		const selection = second.selections.find((s) => s.key === layer1.selectionKey)!;
		expect(selection.featureKeys).toEqual(['B2']);
		expect(selection.featureKeyColourIndexPairs['B2']).toBe(0);
		expect(selection.featureKeyColourIndexPairs['A1']).toBeUndefined();
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapLayerSetFeatureKey = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'missing', layerKey: 'n80', featureKey: 'X' },
		};
		expect(() => reduceHandlerSetFeatureKeyInSelections(state, action)).toThrow('Map with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: undefined,
		} as unknown as ActionMapLayerSetFeatureKey;
		expect(() => reduceHandlerSetFeatureKeyInSelections(state, action)).toThrow(
			'No payload provided for setting featureKey'
		);
	});

	it('throws when layer is not found in target map', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapLayerSetFeatureKey = {
			type: StateActionType.MAP_LAYER_SET_FEATURE_KEY,
			payload: { mapKey: 'mapA', layerKey: 'does-not-exist', featureKey: 'X' },
		};
		expect(() => reduceHandlerSetFeatureKeyInSelections(state, action)).toThrow('No selectionKey found or generated');
	});
});
