import { getLayersByMapKey } from '../../../client/shared/appState/selectors/getLayersByMapKey';
import { AppSharedState } from '../../../client/shared/appState/state.models';
import { RenderingLayer } from '../../../client/shared/models/models.layers';
import { buildAppState, buildMapModel, buildRenderingLayer } from '../../tools/reducer.helpers';

/**
 * Produces a reusable rendering layer fixture with optional overrides.
 */
const createRenderingLayer = (key: string, overrides: Parameters<typeof buildRenderingLayer>[1] = {}): RenderingLayer =>
	buildRenderingLayer(key, overrides);

type MapLayerStub = Partial<RenderingLayer> & { key: string };

/**
 * Creates the rendering-layer stub that lives inside a map model.
 * These partials override properties on top-level rendering layers.
 */
const createMapLayer = (key: string, overrides: Partial<RenderingLayer> = {}): MapLayerStub => ({
	key,
	isActive: true,
	level: 0,
	interaction: null,
	...overrides,
});

/**
 * Builds a single-map model seeded with the provided rendering-layer stubs.
 */
const createMap = (key: string, layers: MapLayerStub[] = [createMapLayer('rendering-layer')]) =>
	buildMapModel(key, { layers });

type CreateFakeStateInput = {
	maps?: ReturnType<typeof createMap>[];
	renderingLayers?: RenderingLayer[];
};

/**
 * Returns a cloned shared state instance tailored for selector testing.
 */
const createFakeState = ({ maps, renderingLayers }: CreateFakeStateInput = {}): AppSharedState => {
	const resolvedRenderingLayers = renderingLayers ?? [createRenderingLayer('rendering-layer')];
	const resolvedMaps = maps ?? [
		createMap('map-1', [createMapLayer(resolvedRenderingLayers[0]?.key ?? 'rendering-layer')]),
	];

	const state = buildAppState({
		maps: resolvedMaps,
		renderingLayers: resolvedRenderingLayers,
	});

	return {
		...state,
		maps: state.maps,
		renderingLayers: state.renderingLayers,
	};
};

describe('Shared state selector: getLayersByMapKey', () => {
	it('merges rendering-layer metadata into map-layer overrides', () => {
		const globalLayer = createRenderingLayer('layer-1', {
			level: 5,
			opacity: 0.4,
		});
		const mapLayer = createMapLayer(globalLayer.key, {
			isActive: false,
			level: 2,
		});
		const map = createMap('map-1', [mapLayer]);
		const fakeState = createFakeState({
			renderingLayers: [globalLayer],
			maps: [map],
		});

		const result = getLayersByMapKey(fakeState, map.key);

		expect(result).toHaveLength(1);
		const [mergedLayer] = result ?? [];
		expect(mergedLayer).not.toBe(globalLayer);
		expect(mergedLayer.key).toBe(globalLayer.key);
		expect(mergedLayer.isActive).toBe(mapLayer.isActive);
		expect(mergedLayer.level).toBe(mapLayer.level);
		expect(mergedLayer.opacity).toBe(globalLayer.opacity);
		expect(mergedLayer.datasource).toEqual(globalLayer.datasource);
	});

	it('returns undefined when map key is unknown', () => {
		const fakeState = createFakeState();

		const result = getLayersByMapKey(fakeState, 'missing-map');

		expect(result).toBeUndefined();
	});

	it('returns undefined when rendering layers are missing', () => {
		const map = createMap('map-1', [createMapLayer('layer-without-metadata')]);
		const fakeState = createFakeState({
			renderingLayers: [],
			maps: [map],
		});

		const result = getLayersByMapKey(fakeState, map.key);

		expect(result).toBeUndefined();
	});
});
