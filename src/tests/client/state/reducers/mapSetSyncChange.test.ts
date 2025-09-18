/**
 * @file Unit tests for the mapSetSyncChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetSyncChange } from '../../../../client/shared/appState/reducerHandlers/mapSetSyncChange';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet sync change', () => {
	it('merges provided sync changes with existing sync for the target mapSet', () => {
		const state = { ...fullAppSharedStateMock };
		const targetKey = 'mapSetLayersDemo';
		const before = state.mapSets.find((s) => s.key === targetKey)!;
		expect(before.sync).toEqual({ zoom: true, center: true });

		const action = {
			type: StateActionType.MAP_SET_SYNC_CHANGE,
			payload: { key: targetKey, syncChange: { center: false } },
		};

		const result = reduceHandlerMapSetSyncChange(state, action);

		// Immutability
		expect(result).not.toBe(state);
		expect(result.mapSets).not.toBe(state.mapSets);

		const after = result.mapSets.find((s) => s.key === targetKey)!;
		// center changed, zoom preserved
		expect(after.sync).toEqual({ zoom: true, center: false });

		// Unrelated slices preserved by reference
		expect(result.maps).toBe(state.maps);
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);
		// Other mapSet properties unchanged
		expect(after.view).toEqual(before.view);
	});

	it('updates both zoom and center flags', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_SET_SYNC_CHANGE,
			payload: { key: 'mapSetLayersDemo', syncChange: { zoom: false, center: false } },
		};
		const result = reduceHandlerMapSetSyncChange(state, action);
		const after = result.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		expect(after.sync).toEqual({ zoom: false, center: false });
	});

	it('throws when mapSet is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action = {
			type: StateActionType.MAP_SET_SYNC_CHANGE,
			payload: { key: 'missing', syncChange: { zoom: false } },
		};
		expect(() => reduceHandlerMapSetSyncChange(state, action)).toThrow('MapSet with key missing not found');
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const action = JSON.parse('{}');
		action.type = StateActionType.MAP_SET_SYNC_CHANGE;
		expect(() => reduceHandlerMapSetSyncChange(state, action)).toThrow(
			'No payload provided for map set sync change action'
		);
	});
});
