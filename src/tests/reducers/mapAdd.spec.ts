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

describe('Shared state reducer: mapAdd', () => {
	it('appends a new map when the key is unique', () => {
		const fakeState = createFakeState();
		const newMap = mapModel('detail-map');

		const result = reduceHandlerMapAdd(fakeState, action(newMap));

		expect(result.maps).toHaveLength(fakeState.maps.length + 1);
		expect(result.maps.at(-1)).toBe(newMap);
		expect(result.maps.slice(0, -1)).toEqual(fakeState.maps);
	});

	it('returns the same state when the map already exists', () => {
		const fakeState = createFakeState();
		const duplicate = mapModel('overview-map');

		const result = reduceHandlerMapAdd(fakeState, action(duplicate));

		expect(result).toBe(fakeState);
		expect(result.maps).toBe(fakeState.maps);
	});

	it('does not mutate the original maps array when adding', () => {
		const fakeState = createFakeState();
		const newMap = mapModel('climate-map');

		const result = reduceHandlerMapAdd(fakeState, action(newMap));

		expect(result.maps).not.toBe(fakeState.maps);
		expect(fakeState.maps).toHaveLength(1);
	});
});
