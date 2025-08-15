import { AppSharedState } from '../state.models';
import { RenderingLayer } from '../../models/models.layers';
import { getRenderingLayerByKey } from './getRenderingLayerByKey';

/**
 * Retrieves a list of rendering layers from the shared application state based on the provided keys.
 * For each key, the corresponding rendering layer is fetched and added to the result array if it exists.
 *
 * @param {AppSharedState} state - The shared application state containing rendering layers.
 * @param {string[]} keys - An array of keys used to retrieve the corresponding rendering layers.
 * @returns {RenderingLayer[]} An array of rendering layers that match the provided keys.
 */
export const getRenderingLayersByKeys = (state: AppSharedState, keys: string[]): RenderingLayer[] => {
	const renderingLayers: RenderingLayer[] = [];

	// Iterate over the provided keys and fetch the corresponding rendering layer
	keys?.forEach((key) => {
		const layer = getRenderingLayerByKey(state, key);
		if (layer) {
			renderingLayers.push(layer);
		}
	});

	// Return the array of rendering layers
	return renderingLayers;
};
