/**
 * @file Unit tests for the mapSetRemove reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetRemove } from '../../../../client/shared/appState/reducerHandlers/mapSetRemove';
import { ActionMapSetRemove } from '../../../../client/shared/appState/state.models.actions';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet remove', () => {
	it('removes the mapSet by key', () => {
		const state = { ...fullAppSharedStateMock };
		const targetKey = 'mapSetLayersDemo';
		const beforeLen = state.mapSets.length;

		const action: ActionMapSetRemove = {
			type: StateActionType.MAP_SET_REMOVE,
			payload: { mapSetKey: targetKey },
		};

		const result = reduceHandlerMapSetRemove(state, action);

		expect(result).not.toBe(state);
		expect(result.mapSets).not.toBe(state.mapSets);
		expect(result.mapSets).toHaveLength(beforeLen - 1);
		expect(result.mapSets.find((s) => s.key === targetKey)).toBeUndefined();

		// Other slices preserved by reference
		expect(result.maps).toBe(state.maps);
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);
	});

	it('keeps content equal when key not found, but updates array immutably', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapSetRemove = {
			type: StateActionType.MAP_SET_REMOVE,
			payload: { mapSetKey: 'non-existent' },
		};

		const result = reduceHandlerMapSetRemove(state, action);
		expect(result.mapSets).not.toBe(state.mapSets);
		expect(result.mapSets).toEqual(state.mapSets);
	});

	it('throws when payload or key is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const invalidAction = { type: StateActionType.MAP_SET_REMOVE } as unknown as ActionMapSetRemove;
		expect(() => reduceHandlerMapSetRemove(state, invalidAction)).toThrow(
			'No payload or mapSetKey provided for map set remove action'
		);

		expect(() => reduceHandlerMapSetRemove(state, { type: StateActionType.MAP_SET_REMOVE, payload: {} } as ActionMapSetRemove)).toThrow(
			'No payload or mapSetKey provided for map set remove action'
		);
	});
});
