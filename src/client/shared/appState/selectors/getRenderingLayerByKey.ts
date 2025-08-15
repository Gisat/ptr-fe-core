import { AppSharedState } from '../state.models';
import { RenderingLayer } from '../../models/models.layers';
import { getStyleByRenderingLayerKey } from './getStyleByRenderingLayerKey';

/**
 * Retrieves a rendering layer by its key from the shared application state.
 * If a style is associated with the rendering layer, its configuration is merged
 * with the datasource configuration of the rendering layer.
 *
 * @param {AppSharedState} state - The shared application state containing rendering layers.
 * @param {string} key - The key of the rendering layer to retrieve.
 * @returns {RenderingLayer | undefined} The rendering layer with merged configurations, or undefined if not found.
 */
export const getRenderingLayerByKey = (state: AppSharedState, key: string | undefined): RenderingLayer | undefined => {
	// Check if the key is provided
	if (!key) {
		console.warn('getRenderingLayerByKey: key is undefined');
		return undefined;
	}

	// Retrieve the list of rendering layers from the state
	const renderingLayers = state?.renderingLayers;

	// Return undefined if no rendering layers are found
	if (!renderingLayers?.length) return undefined;

	// Find the rendering layer with the specified key
	let renderingLayer = renderingLayers.find((layer) => layer.key === key);
	if (!renderingLayer) return undefined;

	// Retrieve the style associated with the rendering layer key
	const style = getStyleByRenderingLayerKey(state, key);

	// If a style is found and it has a configuration, merge it with the datasource configuration
	if (style && typeof style.configuration === 'object') {
		let configuration = style.configuration;

		// Merge existing datasource configuration with the style configuration if both exist
		if (renderingLayer.datasource?.configuration && typeof renderingLayer.datasource.configuration === 'object') {
			configuration = {
				...renderingLayer.datasource.configuration,
				...style.configuration,
			};
		}

		// Update the rendering layer with the merged configuration
		renderingLayer = {
			...renderingLayer,
			datasource: {
				...renderingLayer.datasource,
				configuration,
			},
		};
	}

	// Return the updated rendering layer
	return renderingLayer;
};
