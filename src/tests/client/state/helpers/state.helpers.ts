import { AppSharedState } from '../../../../client/shared/appState/state.models';
import { ApplicationNode, Datasource } from '../../../../globals/shared/panther/models.nodes';

/**
 * Creates a minimal datasource object.
 * @param {string} key - The unique key for the datasource.
 * @returns {Datasource} The created datasource object.
 */
export const createDatasource = (key: string): Datasource => ({
	key,
	nameDisplay: `Display name of ${key}`,
	nameInternal: `Internal name of ${key}`,
	description: `Description of ${key}`,
	labels: ['datasource'],
	lastUpdatedAt: 1756201043326,
	configuration: '{}',
	url: `https://example.com/${key}`,
});

/**
 * Represents an application node with metadata.
 * @type {ApplicationNode}
 */
export const appNode: ApplicationNode = {
	key: 'app',
	nameDisplay: 'App',
	nameInternal: 'app',
	description: null,
	labels: ['application'],
	lastUpdatedAt: 0,
	configuration: '{}',
};

export interface BuildFakeStateOptions {
	maps?: number;
	layersPerMap?: number;
	overrides?: Partial<AppSharedState>;
}

export const buildFakeState = ({
	maps = 1,
	layersPerMap = 1,
	overrides = {},
}: BuildFakeStateOptions = {}): AppSharedState => {
	const renderingLayers = Array.from({ length: layersPerMap }).map((_, i) => ({
		key: `layer-${i + 1}`,
		isActive: false,
		level: 0,
		interaction: null,
		datasource: createDatasource(`layer-${i + 1}`),
	}));

	const mapsArr = Array.from({ length: maps }).map((_, m) => ({
		key: `map${m + 1}`,
		view: { zoom: 5, latitude: 0, longitude: 0 },
		renderingLayers: renderingLayers.map((l) => ({ key: l.key, isActive: false })),
	}));

	return {
		appNode,
		renderingLayers,
		layers: [],
		places: [],
		mapSets: [],
		maps: mapsArr,
		styles: [],
		periods: [],
		selections: [],
		...overrides,
	};
};
