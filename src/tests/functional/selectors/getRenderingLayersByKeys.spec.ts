import { getRenderingLayerByKey } from '../../../client/shared/appState/selectors/getRenderingLayerByKey';
import { getRenderingLayersByKeys } from '../../../client/shared/appState/selectors/getRenderingLayersByKeys';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { RenderingLayer } from '../../../client/shared/models/models.layers';
import { buildAppState, buildRenderingLayer } from '../../tools/reducer.helpers';
import { parseDatasourceConfiguration } from '../../../client/shared/models/parsers.datasources';
import { FullPantherEntityWithNeighboursAsProp } from '../../../client/shared/models/models.metadata';

/**
 * Rendering layer identifiers used throughout the tests.
 */
const RENDERING_LAYER_KEYS = ['render-layer-1', 'render-layer-2'];
/**
 * Layer keys linked to rendering layers via datasource neighbours.
 */
const LAYER_KEYS = ['layer-1', 'layer-2'];
/**
 * Style keys connected to layers so the selector can resolve configurations.
 */
const STYLE_KEYS = ['style-1', 'style-2'];

/**
 * Mock style configurations, mirroring how datasource settings are merged.
 */
const STYLE_CONFIGURATIONS = [
	{
		cogBitmapOptions: {
			useChannel: 1,
		},
	},
	{
		cogBitmapOptions: {
			useChannel: 2,
		},
	},
];

/**
 * Datasource configurations that should be merged with style entries.
 */
const DATASOURCE_CONFIGURATIONS = [
	{
		geojsonOptions: {
			featureIdProperty: 'id',
			selectionStyle: {
				distinctColours: ['#111111'],
				distinctItems: true,
				maxSelectionCount: 5,
			},
		},
	},
	{
		geojsonOptions: {
			featureIdProperty: 'uuid',
			selectionStyle: {
				distinctColours: ['#222222'],
				distinctItems: true,
				maxSelectionCount: 10,
			},
		},
	},
];

/**
 * Builds a layer stub whose neighbours reference a specific style.
 */
const createLayer = (index: number): FullPantherEntityWithNeighboursAsProp => {
	const key = LAYER_KEYS[index];

	return {
		labels: ['layer'],
		key,
		nameDisplay: key,
		nameInternal: key,
		description: '',
		lastUpdatedAt: 0,
		neighbours: [STYLE_KEYS[index]],
	};
};

/**
 * Assembles a style stub with the corresponding configuration.
 */
const createStyle = (index: number): FullPantherEntityWithNeighboursAsProp => {
	const key = STYLE_KEYS[index];

	return {
		labels: ['style'],
		key,
		nameDisplay: key,
		nameInternal: key,
		description: '',
		lastUpdatedAt: 0,
		specificName: key,
		configuration: parseDatasourceConfiguration(STYLE_CONFIGURATIONS[index]),
	};
};

/**
 * Produces a rendering layer whose datasource points at the layer under test.
 */
const createRenderingLayer = (index: number): RenderingLayer =>
	buildRenderingLayer(RENDERING_LAYER_KEYS[index], {
		datasource: {
			neighbours: [LAYER_KEYS[index]],
			configuration: parseDatasourceConfiguration(DATASOURCE_CONFIGURATIONS[index]),
		},
	});

/**
 * Composes the minimal shared state needed for these selector scenarios.
 */
const createState = (): AppSharedState => {
	const renderingLayers = RENDERING_LAYER_KEYS.map((_, index) => createRenderingLayer(index));
	const layers = LAYER_KEYS.map((_, index) => createLayer(index));
	const styles = STYLE_KEYS.map((_, index) => createStyle(index));
	const state = buildAppState({ renderingLayers });

	return {
		...state,
		renderingLayers,
		layers,
		styles,
	};
};

describe('Shared state selector: getRenderingLayersByKeys', () => {
	it('returns rendering layers matching provided keys', () => {
		// Step 1: Prepare state containing two rendering layers tied to styles.
		const fakeState = createState();
		const keys = [...RENDERING_LAYER_KEYS];

		// Step 2: Collect rendering layers via the batched selector.
		const result = getRenderingLayersByKeys(fakeState, keys);
		const expected = keys
			.map((key) => getRenderingLayerByKey(fakeState, key))
			.filter((layer): layer is RenderingLayer => Boolean(layer));

		// Step 3: Ensure the batch result mirrors individual lookups.
		expect(result).toEqual(expected);
	});

	it('skips keys that do not resolve to rendering layers', () => {
		// Step 1: Seed the default state so only known keys resolve.
		const fakeState = createState();

		// Step 2: Request a mix of valid and invalid keys.
		const result = getRenderingLayersByKeys(fakeState, [RENDERING_LAYER_KEYS[0], 'missing-layer']);
		const expected = getRenderingLayerByKey(fakeState, RENDERING_LAYER_KEYS[0]);

		// Step 3: Expect only the valid rendering layer to be included.
		expect(result).toEqual(expected ? [expected] : []);
	});

	it('returns empty array when no keys provided', () => {
		// Step 1: Use the baseline fixture for consistency.
		const fakeState = createState();

		// Step 2: Invoke the selector without supplying any keys.
		const result = getRenderingLayersByKeys(fakeState, []);

		// Step 3: Verify the selector yields an empty array.
		expect(result).toEqual([]);
	});
});
