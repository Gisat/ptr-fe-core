import { AppSharedState } from '../state.models';
import { RenderingLayer } from '../../models/models.layers';
import { getRenderingLayerByKey } from './getRenderingLayerByKey';

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
			const renderingLayer = getRenderingLayerByKey(state, layer?.key) || {};
			return { ...renderingLayer, ...layer };
		})
		.filter(Boolean) as RenderingLayer[];
};
