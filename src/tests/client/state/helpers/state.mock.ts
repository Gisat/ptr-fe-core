import { AppSharedState } from '../../../../client/shared/appState/state.models';
import { appNode, buildFakeState, createDatasource } from './state.helpers';

// Minimal state used for most reducer tests
const fakeState: AppSharedState = {
	appNode,
	renderingLayers: [],
	layers: [],
	places: [],
	mapSets: [],
	maps: [
		{
			key: 'map1',
			view: { zoom: 5, latitude: 0, longitude: 0 },
			renderingLayers: [{ key: 'layerA', isActive: true, isInteractive: false }],
		},
		{
			key: 'map2',
			view: { zoom: 4, latitude: 1, longitude: 1 },
			renderingLayers: [{ key: 'layerB', isActive: false, isInteractive: true }],
		},
	],
	styles: [],
	periods: [],
	selections: [],
};

// More comprehensive state covering maps, mapSets and rendering layers
const fakeFullState: AppSharedState = {
	appNode,
	renderingLayers: [
		{
			key: 'layer-1',
			isActive: false,
			level: 0,
			interaction: null,
			datasource: createDatasource('layer-1'),
		},
		{
			key: 'layer-2',
			isActive: false,
			level: 0,
			interaction: null,
			datasource: createDatasource('layer-2'),
		},
	],
	mapSets: [
		{
			key: 'mapSet1',
			maps: ['map1', 'map2'],
			view: { zoom: 1, latitude: 0, longitude: 0 },
			sync: { zoom: true, center: true },
		},
	],
	maps: [
		{
			key: 'map1',
			renderingLayers: [
				{ key: 'layer-1', isActive: true, opacity: 0.5 },
				{ key: 'layer-2', isActive: false, opacity: 0.7 },
			],
			view: { zoom: 2, latitude: 10, longitude: 10 },
		},
		{
			key: 'map2',
			renderingLayers: [
				{ key: 'layer-1', isActive: false, opacity: 0.5 },
				{ key: 'layer-2', isActive: true, opacity: 0.7 },
			],
			view: { zoom: 3, latitude: 20, longitude: 20 },
		},
	],
	layers: [],
	places: [],
	styles: [],
	periods: [],
	selections: [],
};

export const createFakeState = (overrides: Partial<AppSharedState> = {}): AppSharedState =>
	Object.assign(structuredClone(fakeState), overrides);

export const createFakeFullState = (overrides: Partial<AppSharedState> = {}): AppSharedState =>
	Object.assign(structuredClone(fakeFullState), overrides);

export { buildFakeState, fakeFullState, fakeState };
