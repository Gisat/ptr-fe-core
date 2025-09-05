import { AppSharedState } from '../../../../client/shared/appState/state.models';

/**
 * Fixture: base shared state with two maps and rendering layers.
 * Accepts optional shallow overrides to tweak the returned state for specific tests.
 * @param overrides Partial overrides for the base AppSharedState
 * @returns AppSharedState
 */
export const createBaseState = (overrides: Partial<AppSharedState> = {}): AppSharedState => {
	const base: AppSharedState = {
		appNode: {
			key: 'app',
			description: null,
			lastUpdatedAt: Date.now(),
			nameDisplay: 'App',
			nameInternal: 'appInternal',
			configuration: {},
			labels: [],
		},
		renderingLayers: [],
		layers: [],
		places: [],
		mapSets: [],
		maps: [
			{
				key: 'map1',
				name: 'Map 1',
				renderingLayers: [
					{ key: 'layerA', isActive: true, isInteractive: false },
					{ key: 'layerB', isActive: true, isInteractive: true },
				],
				view: { center: [0, 0], zoom: 5, boxRange: 1000 },
			},
			{
				key: 'map2',
				name: 'Map 2',
				renderingLayers: [{ key: 'layerC', isActive: false, isInteractive: false }],
				view: { center: [1, 1], zoom: 4, boxRange: 1000 },
			},
		] as any,
		styles: [],
		periods: [],
		selections: [],
	};

	return { ...base, ...overrides };
};

export const sharedStateMocks: Record<string, AppSharedState> = {
	twoLayersFound: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [
			{
				key: 'layer-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-1',
					nameDisplay: 'Layer 1 Display',
					nameInternal: 'Layer 1',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-1',
				},
			},
			{
				key: 'layer-2',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-2',
					nameDisplay: 'Layer 2 Display',
					nameInternal: 'Layer 2',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-2',
				},
			},
		],
		mapSets: [],
		maps: [
			{
				key: 'map1',
				renderingLayers: [
					{ key: 'layer-1', isActive: true, opacity: 0.5 },
					{ key: 'layer-2', isActive: true, opacity: 0.7 },
				],
				view: { zoom: 5, latitude: 0, longitude: 0 },
			},
		],
		layers: [],
		places: [],
		styles: [],
		periods: [],
		selections: [],
	},

	oneLayerMissing: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [
			{
				key: 'layer-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-1',
					nameDisplay: 'Layer 1 Display',
					nameInternal: 'Layer 1',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-1',
				},
			},
		],
		mapSets: [],
		maps: [
			{
				key: 'map2',
				renderingLayers: [
					{ key: 'layer-1', isActive: true, opacity: 0.5 },
					{ key: 'layer-x', isActive: true, opacity: 0.7 },
				],
				view: { zoom: 5, latitude: 0, longitude: 0 },
			},
		],
		layers: [],
		places: [],
		styles: [],
		periods: [],
		selections: [],
	},

	unknownMap: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [
			{
				key: 'layer-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-1',
					nameDisplay: 'Layer 1 Display',
					nameInternal: 'Layer 1',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-1',
				},
			},
		],
		mapSets: [],
		maps: [],
		layers: [],
		places: [],
		styles: [],
		periods: [],
		selections: [],
	},

	emptyMapLayers: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [
			{
				key: 'layer-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-1',
					nameDisplay: 'Layer 1 Display',
					nameInternal: 'Layer 1',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-1',
				},
			},
		],
		mapSets: [],
		maps: [
			{
				key: 'map4',
				renderingLayers: [],
				view: { zoom: 5, latitude: 0, longitude: 0 },
			},
		],
		layers: [],
		places: [],
		styles: [],
		periods: [],
		selections: [],
	},

	emptyGlobalLayers: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [],
		mapSets: [],
		maps: [
			{
				key: 'map1',
				renderingLayers: [
					{ key: 'layer-1', isActive: true, opacity: 0.5 },
					{ key: 'layer-2', isActive: true, opacity: 0.7 },
				],
				view: { zoom: 5, latitude: 0, longitude: 0 },
			},
		],
		layers: [],
		places: [],
		styles: [],
		periods: [],
		selections: [],
	},

	mapSetWithTwoMapsNoSync: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [
			{
				key: 'layer-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-1',
					nameDisplay: 'Layer 1 Display',
					nameInternal: 'Layer 1',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-1',
				},
			},
			{
				key: 'layer-2',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-2',
					nameDisplay: 'Layer 2 Display',
					nameInternal: 'Layer 2',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-2',
				},
			},
		],
		mapSets: [
			{
				key: 'mapSet1',
				maps: ['map1', 'map2'],
				view: { zoom: 1, latitude: 0, longitude: 0 },
				sync: { zoom: false, center: false },
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
	},

	mapSetWithTwoMapsSync: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [
			{
				key: 'layer-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-1',
					nameDisplay: 'Layer 1 Display',
					nameInternal: 'Layer 1',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-1',
				},
			},
			{
				key: 'layer-2',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-2',
					nameDisplay: 'Layer 2 Display',
					nameInternal: 'Layer 2',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-2',
				},
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
	},

	mapWithoutMapSet: {
		appNode: {
			labels: ['application'],
			nameInternal: 'demo-app',
			lastUpdatedAt: 1740146136882,
			configuration: '{}',
			nameDisplay: 'Demo App',
			description: '',
			key: 'demo',
		},
		renderingLayers: [
			{
				key: 'layer-1',
				isActive: false,
				level: 0,
				interaction: null,
				datasource: {
					key: 'layer-1',
					nameDisplay: 'Layer 1 Display',
					nameInternal: 'Layer 1',
					description: '',
					labels: ['datasource'],
					lastUpdatedAt: 123456,
					configuration: '{}',
					url: 'https://example.com/layer-1',
				},
			},
		],
		mapSets: [],
		maps: [
			{
				key: 'map1',
				renderingLayers: [{ key: 'layer-1', isActive: true, opacity: 0.5 }],
				view: { zoom: 2, latitude: 10, longitude: 10 },
			},
		],
		layers: [],
		places: [],
		styles: [],
		periods: [],
		selections: [],
	},
};
