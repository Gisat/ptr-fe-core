import { StateActionType } from '../../../client/shared/appState/enum.state.actionType';
import { reduceHandlerFetchSources } from '../../../client/shared/appState/reducerHandlers/fetchSourcesUpdate';
import { ActionChangeLayerSources } from '../../../client/shared/appState/state.models.actions';
import { RenderingLayer } from '../../../client/shared/models/models.layers';
import { Datasource } from '../../../globals/shared/panther/models.nodes';
import {
	buildAppState,
	buildRenderingLayer,
	cloneRenderingLayer,
	makeActionFactory,
} from '../../tools/reducer.helpers';

// Fixture: initial rendering layers representing a map with two inactive thematic layers.

const baseRenderingLayers: RenderingLayer[] = [
	buildRenderingLayer('vegetation-index', {
		isActive: false,
		datasource: {
			nameDisplay: 'Vegetation Index',
			nameInternal: 'Vegetation Index',
			description: 'NDVI overview',
			url: 'https://example.com/vegetation-index',
		},
	}),
	buildRenderingLayer('urban-footprint', {
		isActive: false,
		datasource: {
			nameDisplay: 'Urban Footprint',
			nameInternal: 'Urban Footprint',
			description: 'Built-up areas',
			url: 'https://example.com/urban-footprint',
		},
	}),
];

// Helper: builds a datasource mock with predictable defaults for layer synthesis.
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

// Action factory for FETCH_SOURCES with typed payload.
const action = makeActionFactory<ActionChangeLayerSources>(StateActionType.FETCH_SOURCES);

/**
 * Exercises the fetchSourcesUpdate reducer so new datasources become rendering layers.
 */
describe('Shared state reducer: fetchSourcesUpdate', () => {
	// Scenario: fake state starts with two baseline layers, expecting new sources appended to the list.
	/**
	 * Confirms that fetching sources appends equivalent rendering layers to the set.
	 */
	it('adds parsed layers to the existing rendering layers', () => {
		// Preserve a copy of the seeded layers to compare before/after
		const fakeState = buildAppState({ renderingLayers: baseRenderingLayers.map(cloneRenderingLayer) });
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

	// Scenario: fake state contains no layers yet, so fetched sources should seed the list from scratch.
	/**
	 * Validates that an empty state seeds renderingLayers from the fetched sources.
	 */
	it('initializes renderingLayers when the state has none', () => {
		// Strip the baseline state to mimic a scenario with no layers yet
		const fakeStateWithoutLayers = buildAppState({ renderingLayers: [] });
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
