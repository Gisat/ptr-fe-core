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
		const layer = createLayer('layer-1');
		const renderingLayer = createRenderingLayer('rendering-layer-1', [layer.key]);
		const fakeState = createFakeState({
			layers: [layer],
			renderingLayers: [renderingLayer],
		});

		const result = getLayerMetadataByRenderingLayerKey(fakeState, renderingLayer.key);

		expect(result).toBe(layer);
	});

	it('returns undefined when rendering layer is invalid', () => {
		const fakeState = createFakeState({ renderingLayers: [] });

		const result = getLayerMetadataByRenderingLayerKey(fakeState, 'some-unknown-key');

		expect(result).toBeUndefined();
	});

	it('returns undefined when key is not provided', () => {
		const fakeState = createFakeState();

		const result = getLayerMetadataByRenderingLayerKey(fakeState, undefined);

		expect(result).toBeUndefined();
	});
});
