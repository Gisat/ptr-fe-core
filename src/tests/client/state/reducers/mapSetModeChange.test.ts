/**
 * @file Unit tests for the mapSetModeChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetModeChange } from '../../../../client/shared/appState/reducerHandlers/mapSetModeChange';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet mode change', () => {
	it('updates mode for the specified mapSet', () => {
		const state = { ...fullAppSharedStateMock };
		const targetKey = 'mapSetLayersDemo';
		const before = state.mapSets.find((s) => s.key === targetKey)!;

		const action = {
			type: StateActionType.MAP_SET_MODE_CHANGE,
			payload: { key: targetKey, mode: 'slider' },
		} as const;

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
		const action = {
			type: StateActionType.MAP_SET_MODE_CHANGE,
			payload: { key: 'missing', mode: 'grid' },
		} as const;
		expect(() => reduceHandlerMapSetModeChange(state, action)).toThrow('MapSet with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		// @ts-expect-error runtime check for missing payload
		expect(() =>
			reduceHandlerMapSetModeChange(state, {
				type: StateActionType.MAP_SET_MODE_CHANGE,
			} as const)
		).toThrow('No payload provided for map set mode change action');
	});
});
