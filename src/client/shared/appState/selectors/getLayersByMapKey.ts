import { AppSharedState } from '../../appState/state.models';
import { RenderingLayer } from '../../models/models.layers';

/**
 * Extract layers for a specific map from the shared state by combining map state and rendering layers.
 * @param state - The shared application state.
 * @param key - The key of the map to extract layers for.
 * @returns {RenderingLayer[] | undefined} The combined layers or undefined if no layers are found.
 */
export const getLayersByMapKey = (state: AppSharedState, key: string): RenderingLayer[] | undefined => {
	const mapLayers = state?.maps?.find((map) => map.key === key)?.renderingLayers;
	const renderingLayers = state?.renderingLayers;

	if (!mapLayers?.length || !renderingLayers?.length) return undefined;

	return mapLayers
		.map((layer) => {
			const renderingLayer = renderingLayers.find((rLayer) => rLayer.key === layer.key);
			return renderingLayer ? { ...renderingLayer, ...layer } : null;
		})
		.filter(Boolean) as RenderingLayer[];
};
