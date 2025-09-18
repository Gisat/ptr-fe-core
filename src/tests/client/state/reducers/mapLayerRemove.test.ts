/**
 * @file Unit tests for the mapLayerRemove reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapLayerRemove } from '../../../../client/shared/appState/reducerHandlers/mapLayerRemove';
import { ActionMapLayerRemove } from '../../../../client/shared/appState/state.models.actions';
import { Selection } from '../../../../client/shared/models/models.selections';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: Map layer remove', () => {
	it('removes the layer and deletes its selection when selectionKey exists', () => {
		const selections: Selection[] = [
			{
				key: 'sel-1',
				distinctColours: ['#111'],
				distinctItems: true,
				featureKeys: ['f-1'],
				featureKeyColourIndexPairs: { 'f-1': 0 },
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

		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const beforeMapB = state.maps.find((m) => m.key === 'mapB')!;
		const beforeLen = beforeMapA.renderingLayers.length;
		const action: ActionMapLayerRemove = {
			type: StateActionType.MAP_LAYER_REMOVE,
			payload: { mapKey: 'mapA', layerKey: 'n80' },
		};

		const result = reduceHandlerMapLayerRemove(state, action);

		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;
		const afterMapB = result.maps.find((m) => m.key === 'mapB')!;

		// Immutability and targeted updates
		expect(result).not.toBe(state);
		expect(result.maps).not.toBe(state.maps);
		expect(afterMapA).not.toBe(beforeMapA);
		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapB).toBe(beforeMapB);

		// Layer removed
		expect(afterMapA.renderingLayers).toHaveLength(beforeLen - 1);
		expect(afterMapA.renderingLayers.find((l) => l.key === 'n80')).toBeUndefined();

		// Selection removed and selections array replaced
		expect(result.selections).not.toBe(state.selections);
		expect(result.selections.find((s) => s.key === 'sel-1')).toBeUndefined();
		expect(result.selections.find((s) => s.key === 'keep')).toBeTruthy();
	});

	it('removes the layer and preserves selections reference when no selectionKey is present', () => {
		const state = {
			...fullAppSharedStateMock,
			selections: [
				{
					key: 'keep',
					distinctColours: ['#222'],
					distinctItems: true,
					featureKeys: ['x'],
					featureKeyColourIndexPairs: { x: 0 },
				},
			],
		};
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const beforeLen = beforeMapA.renderingLayers.length;
		const action: ActionMapLayerRemove = {
			type: StateActionType.MAP_LAYER_REMOVE,
			payload: { mapKey: 'mapA', layerKey: 'cartoLightNoLabels' },
		};

		const result = reduceHandlerMapLayerRemove(state, action);
		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;

		expect(afterMapA.renderingLayers).toHaveLength(beforeLen - 1);
		expect(result.selections).toBe(state.selections); // preserved by reference
	});

	it('keeps layers content equal if layer key not found and preserves selections reference', () => {
		const state = { ...fullAppSharedStateMock, selections: [] as Selection[] };
		const beforeMapA = state.maps.find((m) => m.key === 'mapA')!;
		const action: ActionMapLayerRemove = {
			type: StateActionType.MAP_LAYER_REMOVE,
			payload: { mapKey: 'mapA', layerKey: 'non-existent' },
		};

		const result = reduceHandlerMapLayerRemove(state, action);
		const afterMapA = result.maps.find((m) => m.key === 'mapA')!;

		expect(afterMapA.renderingLayers).not.toBe(beforeMapA.renderingLayers);
		expect(afterMapA.renderingLayers).toEqual(beforeMapA.renderingLayers);
		expect(result.selections).toBe(state.selections);
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapLayerRemove = {
			type: StateActionType.MAP_LAYER_REMOVE,
			payload: { mapKey: 'missing', layerKey: 'n80' },
		};
		expect(() => reduceHandlerMapLayerRemove(state, action)).toThrow('Map with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const invalidAction = { type: StateActionType.MAP_LAYER_REMOVE } as unknown as ActionMapLayerRemove;
		expect(() => reduceHandlerMapLayerRemove(state, invalidAction)).toThrow(
			'No payload provided for map layer remove action'
		);
	});
});
