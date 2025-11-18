import { getStyleByRenderingLayerKey } from '../../../client/shared/appState/selectors/getStyleByRenderingLayerKey';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { buildAppState, buildRenderingLayer } from '../../tools/reducer.helpers';
import { RenderingLayer } from '../../../client';
import {
	FullPantherEntityWithNeighboursAsProp,
	PantherEntityWithNeighbours,
} from '../../../client/shared/models/models.metadata';

/**
 * Rendering layer key under test.
 */
const RENDERING_LAYER_KEY = 'render-layer';
/**
 * Layer key that links the rendering layer to a style.
 */
const LAYER_KEY = 'layer-1';
/**
 * Style key expected to be resolved by the selector.
 */
const STYLE_KEY = 'style-1';

/**
 * Configuration payload attached to the style fixture.
 */
const STYLE_CONFIGURATION = {
	cogBitmapOptions: { useChannel: 1 },
};

/**
 * Produces a minimal layer whose neighbours include the test style.
 */
const createLayer = (): PantherEntityWithNeighbours => ({
	labels: ['layer'],
	key: LAYER_KEY,
	nameDisplay: LAYER_KEY,
	nameInternal: LAYER_KEY,
	description: '',
	lastUpdatedAt: 0,
	neighbours: [STYLE_KEY],
});

/**
 * Builds a style entry associated with the test layer.
 */
const createStyle = (): FullPantherEntityWithNeighboursAsProp => ({
	labels: ['style'],
	key: STYLE_KEY,
	nameDisplay: STYLE_KEY,
	nameInternal: STYLE_KEY,
	description: '',
	lastUpdatedAt: 0,
	specificName: STYLE_KEY,
	configuration: JSON.stringify(STYLE_CONFIGURATION),
});

/**
 * Creates a rendering layer pointing at the linked layer via datasource neighbours.
 */
const createRenderingLayer = (): RenderingLayer =>
	buildRenderingLayer(RENDERING_LAYER_KEY, {
		datasource: {
			neighbours: [LAYER_KEY],
		},
	});

type CreateStateOptions = {
	styles?: AppSharedState['styles'];
	layers?: AppSharedState['layers'];
	renderingLayers?: AppSharedState['renderingLayers'];
};

/**
 * Composes the minimal shared state needed for the selector tests.
 */
const createState = ({
	styles = [createStyle()],
	layers = [createLayer()],
	renderingLayers = [createRenderingLayer()],
}: CreateStateOptions = {}): AppSharedState => {
	const state = buildAppState({ renderingLayers });

	return {
		...state,
		renderingLayers,
		layers,
		styles,
	};
};

describe('Shared state selector: getStyleByRenderingLayerKey', () => {
	it('returns style linked through layer neighbours', () => {
		// Step 1: Prepare state where the rendering layer, layer, and style are linked.
		const fakeState = createState();

		// Step 2: Resolve the style for the rendering layer under test.
		const result = getStyleByRenderingLayerKey(fakeState, RENDERING_LAYER_KEY);

		// Step 3: Confirm the selector returns the expected style.
		expect(result?.key).toBe(STYLE_KEY);
	});

	it('returns undefined when no style matches neighbours', () => {
		// Step 1: Seed state without any styles.
		const fakeState = createState({ styles: [] });

		// Step 2: Attempt to resolve style for the rendering layer.
		const result = getStyleByRenderingLayerKey(fakeState, RENDERING_LAYER_KEY);

		// Step 3: Validate that the selector returns undefined.
		expect(result).toBeUndefined();
	});

	it('returns undefined when key is missing', () => {
		// Step 1: Reuse the default state to keep relationships intact.
		const fakeState = createState();

		// Step 2: Call the selector with an undefined key.
		const result = getStyleByRenderingLayerKey(fakeState, undefined);

		// Step 3: Expect the selector to return undefined defensively.
		expect(result).toBeUndefined();
	});
});
