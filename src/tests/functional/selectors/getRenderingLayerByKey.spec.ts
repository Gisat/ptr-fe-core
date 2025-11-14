import { getRenderingLayerByKey } from '../../../client/shared/appState/selectors/getRenderingLayerByKey';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { buildAppState, buildRenderingLayer } from '../../tools/reducer.helpers';
import { FullPantherEntityWithNeighboursAsProp, RenderingLayer } from '../../../client';
import { PantherEntityWithNeighbours } from '../../../client/shared/models/models.metadata.js';

/**
 * Rendering layer key under test for the success scenario.
 */
const RENDERING_LAYER_KEY = 'rendering-layer';
/**
 * Layer key connected to the rendering layer via datasource neighbours.
 */
const LAYER_KEY = 'layer-1';
/**
 * Style key linked to the layer so the selector can resolve configuration.
 */
const STYLE_KEY = 'style-1';

/**
 * Mock style configuration shaped like a real datasource definition.
 */
const STYLE_CONFIGURATION = {
	cogBitmapOptions: {
		useChannel: 7,
	},
};
/**
 * Base datasource configuration that should be merged with the style config.
 */
const DATASOURCE_CONFIGURATION = {
	geojsonOptions: {
		featureIdProperty: 'id',
		selectionStyle: {
			distinctColours: ['#000000'],
			distinctItems: true,
			maxSelectionCount: 5,
		},
	},
};

/**
 * Produces a lightweight layer entity, wiring neighbours to the style key.
 */
const createLayer = (key: string): PantherEntityWithNeighbours => ({
	labels: ['layer'],
	key,
	nameDisplay: key,
	nameInternal: key,
	description: '',
	lastUpdatedAt: 0,
	neighbours: [STYLE_KEY],
});

/**
 * Returns a style instance that references the mock configuration.
 */
const createStyle = (key: string): FullPantherEntityWithNeighboursAsProp => ({
	labels: ['style'],
	key,
	nameDisplay: key,
	nameInternal: key,
	description: '',
	lastUpdatedAt: 0,
	specificName: key,
	configuration: JSON.stringify(STYLE_CONFIGURATION),
});

/**
 * Builds a rendering layer with datasource neighbours pointing at the layer key.
 */
const createRenderingLayer = (): RenderingLayer =>
	buildRenderingLayer(RENDERING_LAYER_KEY, {
		datasource: {
			neighbours: [LAYER_KEY],
			configuration: JSON.stringify(DATASOURCE_CONFIGURATION),
		},
	});

/**
 * Combines the helper fixtures into a minimal shared-state snapshot.
 */
const createState = (): AppSharedState => {
	const renderingLayers = [createRenderingLayer()];
	const layers = [createLayer(LAYER_KEY)];
	const styles = [createStyle(STYLE_KEY)];
	const state = buildAppState({ renderingLayers });

	return {
		...state,
		renderingLayers,
		layers,
		styles,
	};
};

describe('Shared state selector: getRenderingLayerByKey', () => {
	it('returns rendering layer when key matches', () => {
		// Step 1: Seed state where layer/style relationships mirror the selector contract.
		const fakeState = createState();
		const expectedConfiguration = { ...DATASOURCE_CONFIGURATION, ...STYLE_CONFIGURATION };

		// Step 2: Invoke the selector with the known rendering layer key.
		const result = getRenderingLayerByKey(fakeState, RENDERING_LAYER_KEY);

		// Step 3: Confirm datasource configuration merges base and style values.
		expect(result).toEqual({
			...fakeState.renderingLayers[0],
			datasource: { ...fakeState.renderingLayers[0].datasource, configuration: expectedConfiguration },
		});
	});

	it('returns undefined when key is unknown', () => {
		// Step 1: Prepare the same baseline state to isolate key-mismatch behaviour.
		const fakeState = createState();

		// Step 2: Call the selector with a non-existent rendering layer key.
		const result = getRenderingLayerByKey(fakeState, 'missing-layer');

		// Step 3: Expect the selector to return undefined gracefully.
		expect(result).toBeUndefined();
	});

	it('returns undefined when key is not provided', () => {
		// Step 1: Reuse the baseline state to test defensive input handling.
		const fakeState = createState();

		// Step 2: Query the selector without providing a key.
		const result = getRenderingLayerByKey(fakeState, undefined);

		// Step 3: Validate the selector responds with undefined.
		expect(result).toBeUndefined();
	});
});
