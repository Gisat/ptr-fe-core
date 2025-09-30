import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerMapAdd } from '../../client/shared/appState/reducerHandlers/mapAdd';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionMapAdd } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { SingleMapModel } from '../../client/shared/models/models.singleMap';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const mapLayer = (key: string): RenderingLayer => ({
	key,
	isActive: true,
	level: 0,
	interaction: null,
	datasource: {
		key,
		labels: ['datasource'],
		nameDisplay: key,
		nameInternal: key,
		description: `${key} datasource`,
		lastUpdatedAt: 0,
		url: `https://example.com/${key}`,
		configuration: '{}',
	},
});

const mapModel = (key: string): SingleMapModel => ({
	key,
	view: { latitude: 0, longitude: 0, zoom: 4 },
	renderingLayers: [mapLayer('base-layer')],
});

const cloneMap = (map: SingleMapModel): SingleMapModel => ({
	...map,
	view: { ...map.view },
	renderingLayers: map.renderingLayers.map((layer) => ({ ...layer })),
});

const createFakeState = (maps: SingleMapModel[] = [mapModel('overview-map')]): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: [],
	mapSets: [],
	maps: maps.map(cloneMap),
});

const action = (map: SingleMapModel): ActionMapAdd => ({
	type: StateActionType.MAP_ADD,
	payload: map,
});

/**
 * Covers the mapAdd reducer behaviour for adding new maps safely.
 */
describe('Shared state reducer: mapAdd', () => {
	/**
	 * Verifies a unique map is appended to the collection.
	 */
	it('appends a new map when the key is unique', () => {
		// Create baseline state with single overview map
		const fakeState = createFakeState();
		const newMap = mapModel('detail-map');

		// Apply reducer to add brand-new map
		const result = reduceHandlerMapAdd(fakeState, action(newMap));

		// Check new map appended and existing entries preserved
		expect(result.maps).toHaveLength(fakeState.maps.length + 1);
		expect(result.maps.at(-1)).toBe(newMap);
		expect(result.maps.slice(0, -1)).toEqual(fakeState.maps);
	});

	/**
	 * Ensures the reducer is a no-op when a duplicate key is supplied.
	 */
	it('returns the same state when the map already exists', () => {
		// Prepare state and a duplicate payload
		const fakeState = createFakeState();
		const duplicate = mapModel('overview-map');

		// Reduce with duplicate to ensure reference equality
		const result = reduceHandlerMapAdd(fakeState, action(duplicate));

		expect(result).toBe(fakeState);
		expect(result.maps).toBe(fakeState.maps);
	});

	/**
	 * Confirms the reducer returns a fresh array even when adding succeeds.
	 */
	it('does not mutate the original maps array when adding', () => {
		// Capture existing maps reference before mutation
		const fakeState = createFakeState();
		const newMap = mapModel('climate-map');

		// Reduce to add the new map
		const result = reduceHandlerMapAdd(fakeState, action(newMap));

		// Ensure immutability by comparing collection references
		expect(result.maps).not.toBe(fakeState.maps);
		expect(fakeState.maps).toHaveLength(1);
	});
});
