import { StateActionType } from '../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapAdd } from '../../../client/shared/appState/reducerHandlers/mapAdd';
import { ActionMapAdd } from '../../../client/shared/appState/state.models.actions';
import { buildAppState, buildMapModel, buildRenderingLayer, makeActionFactory } from '../../tools/reducer.helpers';

// Helper: constructs a map model seeded with a single active base layer.
const baseMap = (key: string) =>
	buildMapModel(key, {
		layers: [
			buildRenderingLayer('base-layer', {
				isActive: true,
				interaction: null,
			}),
		],
	});

// Helper: fabricates app state containing the provided maps (defaults to one overview map).
const createFakeState = (maps = [baseMap('overview-map')]) => buildAppState({ maps });

// Action factory for MAP_ADD reducer with typed payload.
const action = makeActionFactory<ActionMapAdd>(StateActionType.MAP_ADD);

/**
 * Covers the mapAdd reducer behaviour for adding new maps safely.
 */
describe('Shared state reducer: mapAdd', () => {
	// Scenario: fake state begins with single overview map; we append a brand-new detail map.
	/**
	 * Verifies a unique map is appended to the collection.
	 */
	it('appends a new map when the key is unique', () => {
		// Create baseline state with single overview map
		const fakeState = createFakeState();
		const newMap = baseMap('detail-map');

		// Apply reducer to add brand-new map
		const result = reduceHandlerMapAdd(fakeState, action(newMap));

		// Check new map appended and existing entries preserved
		expect(result.maps).toHaveLength(fakeState.maps.length + 1);
		expect(result.maps.at(-1)).toBe(newMap);
		expect(result.maps.slice(0, -1)).toEqual(fakeState.maps);
	});

	// Scenario: state already holds overview map; we send duplicate payload and expect a no-op result.
	/**
	 * Ensures the reducer is a no-op when a duplicate key is supplied.
	 */
	it('returns the same state when the map already exists', () => {
		// Prepare state and a duplicate payload
		const fakeState = createFakeState();
		const duplicate = baseMap('overview-map');

		// Reduce with duplicate to ensure reference equality
		const result = reduceHandlerMapAdd(fakeState, action(duplicate));

		expect(result).toBe(fakeState);
		expect(result.maps).toBe(fakeState.maps);
	});

	// Scenario: adding a new map should produce a new array reference even though contents share base layer.
	/**
	 * Confirms the reducer returns a fresh array even when adding succeeds.
	 */
	it('does not mutate the original maps array when adding', () => {
		// Capture existing maps reference before mutation
		const fakeState = createFakeState();
		const newMap = baseMap('climate-map');

		// Reduce to add the new map
		const result = reduceHandlerMapAdd(fakeState, action(newMap));

		// Ensure immutability by comparing collection references
		expect(result.maps).not.toBe(fakeState.maps);
		expect(fakeState.maps).toHaveLength(1);
	});
});
