import { StateActionType } from '../../client/shared/appState/enum.state.actionType';
import { reduceHandlerFetchSources } from '../../client/shared/appState/reducerHandlers/fetchSourcesUpdate';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { ActionChangeLayerSources } from '../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../client/shared/models/models.layers';
import { Datasource } from '../../globals/shared/panther/models.nodes';
import { fullAppSharedStateMock } from '../fixtures/appSharedState.mock';

const baseRenderingLayers: RenderingLayer[] = [
	{
		key: 'vegetation-index',
		isActive: false,
		level: 0,
		datasource: {
			key: 'vegetation-index',
			labels: ['datasource'],
			nameDisplay: 'Vegetation Index',
			nameInternal: 'Vegetation Index',
			description: 'NDVI overview',
			lastUpdatedAt: 0,
			url: 'https://example.com/vegetation-index',
			configuration: '{}',
		},
		interaction: null,
	},
	{
		key: 'urban-footprint',
		isActive: false,
		level: 0,
		datasource: {
			key: 'urban-footprint',
			labels: ['datasource'],
			nameDisplay: 'Urban Footprint',
			nameInternal: 'Urban Footprint',
			description: 'Built-up areas',
			lastUpdatedAt: 0,
			url: 'https://example.com/urban-footprint',
			configuration: '{}',
		},
		interaction: null,
	},
];

const cloneLayer = (layer: RenderingLayer): RenderingLayer => ({
	...layer,
	datasource: { ...layer.datasource },
});

const createFakeState = (): AppSharedState => ({
	...fullAppSharedStateMock,
	renderingLayers: baseRenderingLayers.map(cloneLayer),
});

const createFakeDatasource = (key: string, overrides: Partial<Datasource> = {}): Datasource => ({
	key,
	labels: ['datasource'],
	nameDisplay: key,
	nameInternal: key,
	description: `${key} datasource`,
	lastUpdatedAt: 0,
	url: `https://example.com/${key}`,
	configuration: '{}',
	...overrides,
});

const action = (payload: Datasource[]): ActionChangeLayerSources => ({
	type: StateActionType.FETCH_SOURCES,
	payload,
});

/**
 * Exercises the fetchSourcesUpdate reducer so new datasources become rendering layers.
 */
describe('Shared state reducer: fetchSourcesUpdate', () => {
	/**
	 * Confirms that fetching sources appends equivalent rendering layers to the set.
	 */
	it('adds parsed layers to the existing rendering layers', () => {
		// Preserve a copy of the seeded layers to compare before/after
		const fakeState = createFakeState();
		const existingLayers = [...fakeState.renderingLayers];
		const newSources = [createFakeDatasource('soil-moisture'), createFakeDatasource('precipitation-rate')];

		// Apply reducer with new datasource payload
		const result = reduceHandlerFetchSources(fakeState, action(newSources));

		// Ensure originals are unchanged and new layers were added to the tail
		expect(result.renderingLayers).toHaveLength(existingLayers.length + newSources.length);
		expect(result.renderingLayers[0]).toBe(existingLayers[0]);
		expect(result.renderingLayers[1]).toBe(existingLayers[1]);

		const appended = result.renderingLayers.slice(existingLayers.length);
		expect(appended.map((layer) => layer.key)).toEqual(newSources.map((source) => source.key));
		appended.forEach((layer, index) => {
			expect(layer.isActive).toBe(false);
			expect(layer.level).toBe(0);
			expect(layer.datasource).toEqual(newSources[index]);
		});
	});

	/**
	 * Validates that an empty state seeds renderingLayers from the fetched sources.
	 */
	it('initializes renderingLayers when the state has none', () => {
		// Strip the baseline state to mimic a scenario with no layers yet
		const fakeStateWithoutLayers: AppSharedState = {
			...createFakeState(),
			renderingLayers: [],
		};
		const newSources = [createFakeDatasource('soil-moisture')];

		// Apply reducer to populate the state
		const result = reduceHandlerFetchSources(fakeStateWithoutLayers, action(newSources));

		// Validate the single synthesized layer mirrors the datasource defaults
		expect(result.renderingLayers).toHaveLength(1);

		const [layer] = result.renderingLayers;
		expect(layer.key).toBe('soil-moisture');
		expect(layer.isActive).toBe(false);
		expect(layer.level).toBe(0);
	});
});
