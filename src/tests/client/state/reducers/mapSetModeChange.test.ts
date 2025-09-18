/**
 * @file Unit tests for the mapSetModeChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetModeChange } from '../../../../client/shared/appState/reducerHandlers/mapSetModeChange';
import { ActionMapSetModeChange } from '../../../../client/shared/appState/state.models.actions';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet mode change', () => {
	it('updates mode for the specified mapSet', () => {
		const state = { ...fullAppSharedStateMock };
		const targetKey = 'mapSetLayersDemo';
		const before = state.mapSets.find((s) => s.key === targetKey)!;

		const action: ActionMapSetModeChange = {
			type: StateActionType.MAP_SET_MODE_CHANGE,
			payload: { key: targetKey, mode: 'slider' },
		};

		const result = reduceHandlerMapSetModeChange(state, action);

		// Immutability
		expect(result).not.toBe(state);
		expect(result.mapSets).not.toBe(state.mapSets);

		const after = result.mapSets.find((s) => s.key === targetKey)!;
		expect(after.mode).toBe('slider');

		// Other slices preserved by reference
		expect(result.maps).toBe(state.maps);
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);

		// Unchanged properties preserved
		expect(after.view).toEqual(before.view);
		expect(after.sync).toEqual(before.sync);
	});

	it('throws when mapSet is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapSetModeChange = {
			type: StateActionType.MAP_SET_MODE_CHANGE,
			payload: { key: 'missing', mode: 'grid' },
		};
		expect(() => reduceHandlerMapSetModeChange(state, action)).toThrow('MapSet with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const invalidAction = { type: StateActionType.MAP_SET_MODE_CHANGE } as unknown as ActionMapSetModeChange;
		expect(() => reduceHandlerMapSetModeChange(state, invalidAction)).toThrow(
			'No payload provided for map set mode change action'
		);
	});
});
