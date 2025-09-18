/**
 * @file Unit tests for the mapSetMapViewChange reducer handler.
 */

import { StateActionType } from '../../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapSetMapViewChange } from '../../../../client/shared/appState/reducerHandlers/mapSetMapViewChange';
import { ActionMapViewChange } from '../../../../client/shared/appState/state.models.actions';
import { fullAppSharedStateMock } from '../mocks/fullAppSharedState.mock';

describe('Reducer test: MapSet map view change', () => {
	it('applies zoom and center updates to all maps when sync is enabled', () => {
		const state = { ...fullAppSharedStateMock };

		const action: ActionMapViewChange = {
			type: StateActionType.MAP_VIEW_CHANGE,
			payload: { key: 'mapA', viewChange: { zoom: 7, latitude: 10, longitude: -20 } },
		};

		const result = reduceHandlerMapSetMapViewChange(state, action);

		// Both maps belong to the same map set with sync: { zoom: true, center: true }
		const mapA = result.maps.find((m) => m.key === 'mapA')!;
		const mapB = result.maps.find((m) => m.key === 'mapB')!;
		expect(mapA.view.zoom).toBe(7);
		expect(mapB.view.zoom).toBe(7);
		expect(mapA.view.latitude).toBe(10);
		expect(mapB.view.latitude).toBe(10);
		expect(mapA.view.longitude).toBe(-20);
		expect(mapB.view.longitude).toBe(-20);

		const set = result.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;
		expect(set.view.zoom).toBe(7);
		expect(set.view.latitude).toBe(10);
		expect(set.view.longitude).toBe(-20);

		// Immutability and preservation
		expect(result).not.toBe(state);
		expect(result.maps).not.toBe(state.maps);
		expect(result.mapSets).not.toBe(state.mapSets);
		expect(result.renderingLayers).toBe(state.renderingLayers);
		expect(result.styles).toBe(state.styles);
	});

	it('applies only zoom sync when center sync is disabled', () => {
		const base = { ...fullAppSharedStateMock };
		// Disable center sync for the demo set; keep zoom sync on
		const state = {
			...base,
			mapSets: base.mapSets.map((s) =>
				s.key === 'mapSetLayersDemo' ? { ...s, sync: { zoom: true, center: false } } : s
			),
		};

		const beforeMapB = state.maps.find((m) => m.key === 'mapB')!;

		const action: ActionMapViewChange = {
			type: StateActionType.MAP_VIEW_CHANGE,
			payload: { key: 'mapA', viewChange: { zoom: 5, latitude: 42 } },
		};

		const result = reduceHandlerMapSetMapViewChange(state, action);

		const mapA = result.maps.find((m) => m.key === 'mapA')!;
		const mapB = result.maps.find((m) => m.key === 'mapB')!;
		const set = result.mapSets.find((s) => s.key === 'mapSetLayersDemo')!;

		// Zoom synced to both maps and map set view
		expect(mapA.view.zoom).toBe(5);
		expect(mapB.view.zoom).toBe(5);
		expect(set.view.zoom).toBe(5);

		// Center change applied only to the triggering map; mapB center unchanged
		expect(mapA.view.latitude).toBe(42);
		expect(mapB.view.latitude).toBe(beforeMapB.view.latitude);
		// MapSet view center remains unchanged
		expect(set.view.latitude).toBe(base.mapSets.find((s) => s.key === 'mapSetLayersDemo')!.view.latitude);
	});

	it('throws when payload is missing', () => {
		const state = { ...fullAppSharedStateMock };
		const invalidAction = { type: StateActionType.MAP_VIEW_CHANGE } as unknown as ActionMapViewChange;
		expect(() => reduceHandlerMapSetMapViewChange(state, invalidAction)).toThrow(
			'No payload provided for map view change action'
		);
	});

	it('throws when map is not found', () => {
		const state = { ...fullAppSharedStateMock };
		const action: ActionMapViewChange = {
			type: StateActionType.MAP_VIEW_CHANGE,
			payload: { key: 'missing', viewChange: { zoom: 3 } },
		};
		expect(() => reduceHandlerMapSetMapViewChange(state, action)).toThrow('Map with key missing not found');
	});

	it('throws when parent map set is not found', () => {
		// Create a map not in any map set
		const state = {
			...fullAppSharedStateMock,
			maps: [
				...fullAppSharedStateMock.maps,
				{ key: 'lonelyMap', renderingLayers: [], view: { zoom: 1, latitude: 0, longitude: 0 } },
			],
		};
		const action: ActionMapViewChange = {
			type: StateActionType.MAP_VIEW_CHANGE,
			payload: { key: 'lonelyMap', viewChange: { zoom: 4 } },
		};
		expect(() => reduceHandlerMapSetMapViewChange(state, action)).toThrow(
			'Parent MapSet for map with key lonelyMap not found'
		);
	});
});
