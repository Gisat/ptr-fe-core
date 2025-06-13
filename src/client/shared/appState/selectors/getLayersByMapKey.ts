import { AppSharedState } from '../../appState/state.models';
import { RenderingLayer } from '../../models/models.layers';
import { getStyleByRenderingLayerKey } from '../selectors/getStyleByRenderingLayerKey';

/**
 * Extract layers for a specific map from the shared state by combining map state, rendering layers and style.
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
			if (!renderingLayer) return null;

			// Merge rendering layer with the layer from map definition
			let layerForMap = { ...renderingLayer, ...layer };

			// Find the style for the rendering layer
			const style = getStyleByRenderingLayerKey(state, layer.key);

			// If the rendering layer has a datasource, add configuration from the style
			if (style && typeof style.configuration === 'object') {
				let configuration = style.configuration;
				if (renderingLayer.datasource?.configuration && typeof renderingLayer.datasource.configuration === 'object') {
					// Merge existing datasource configuration with style configuration
					configuration = {
						...renderingLayer.datasource.configuration,
						...style.configuration,
					};
				}

				layerForMap = {
					...layerForMap,
					datasource: {
						...renderingLayer.datasource,
						configuration,
					},
				};
			}

			return layerForMap;
		})
		.filter(Boolean) as RenderingLayer[];
};
