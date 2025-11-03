import { getLayerMetadataByRenderingLayerKey } from '../../client/shared/appState/selectors/getLayerMetadataByRenderingLayerKey';
import { AppSharedState } from '../../client/shared/appState/state.models';
import { buildAppState, buildRenderingLayer } from '../tools/reducer.helpers';

/**
 * Produces a lightweight layer metadata stub for selector testing.
 */
const createLayer = (key: string): AppSharedState['layers'][number] => ({
	labels: ['layer'],
	key,
	nameDisplay: key,
	nameInternal: key,
	description: null,
	lastUpdatedAt: 0,
});

/**
 * Builds a rendering layer whose datasource neighbours point to provided layer keys.
 */
const createRenderingLayer = (key: string, neighbours: string[]): AppSharedState['renderingLayers'][number] =>
	buildRenderingLayer(key, {
		datasource: { neighbours },
	});

type CreateFakeStateInput = {
	layers?: AppSharedState['layers'];
	renderingLayers?: AppSharedState['renderingLayers'];
};

/**
 * Creates a cloned app state seeded with the supplied layer and rendering-layer fixtures.
 */
const createFakeState = ({ layers, renderingLayers }: CreateFakeStateInput = {}): AppSharedState => {
	const resolvedLayers = layers ?? [createLayer('layer-metadata')];
	const defaultNeighbourKey = resolvedLayers[0]?.key;
	const resolvedRenderingLayers = renderingLayers ?? [
		createRenderingLayer('rendering-layer', defaultNeighbourKey ? [defaultNeighbourKey] : []),
	];

	return {
		...buildAppState({ renderingLayers: resolvedRenderingLayers }),
		layers: resolvedLayers,
		renderingLayers: resolvedRenderingLayers,
	};
};

describe('Shared state selector: getLayerMetadataByRenderingLayerKey', () => {
	it('returns metadata for rendering layer neighbours', () => {
		// Step 1: Set up linked layer and rendering layer fixtures.
		const layer = createLayer('layer-1');
		const renderingLayer = createRenderingLayer('rendering-layer-1', [layer.key]);
		const fakeState = createFakeState({
			layers: [layer],
			renderingLayers: [renderingLayer],
		});

		// Step 2: Query metadata using the rendering layer key.
		const result = getLayerMetadataByRenderingLayerKey(fakeState, renderingLayer.key);

		// Step 3: Expect the selector to return the linked layer metadata.
		expect(result).toBe(layer);
	});

	it('returns undefined when rendering layer is invalid', () => {
		// Step 1: Provide state lacking the target rendering layer.
		const fakeState = createFakeState({ renderingLayers: [] });

		// Step 2: Attempt to resolve metadata for a non-existent key.
		const result = getLayerMetadataByRenderingLayerKey(fakeState, 'some-unknown-key');

		// Step 3: Validate the selector returns undefined.
		expect(result).toBeUndefined();
	});

	it('returns undefined when key is not provided', () => {
		// Step 1: Use the default fixture with valid relationships.
		const fakeState = createFakeState();

		// Step 2: Invoke the selector without supplying a key.
		const result = getLayerMetadataByRenderingLayerKey(fakeState, undefined);

		// Step 3: Confirm the selector handles missing keys gracefully.
		expect(result).toBeUndefined();
	});
});
