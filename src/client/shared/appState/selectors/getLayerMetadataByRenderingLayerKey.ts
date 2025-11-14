import { AppSharedState } from '../state.models';
import { getAllLayers } from './getAllLayers';
import { PantherEntityWithNeighbours } from '../../models/models.metadata.js';

/**
 * Retrieves metadata for a layer based on the rendering layer key.
 *
 * This function searches for a rendering layer in the application state using the provided key.
 * If the rendering layer is found, it retrieves its neighboring keys and uses them to find
 * the corresponding layer metadata from all layers in the state.
 *
 * @param {AppSharedState} state - The shared application state containing rendering layers and other data.
 * @param {string | undefined} key - The key of the rendering layer to search for.
 * @returns {PantherEntityWithNeighbours | undefined} The metadata of the layer associated with the rendering layer key, or `undefined` if not found.
 */
export const getLayerMetadataByRenderingLayerKey = (
	state: AppSharedState,
	key: string | undefined
): PantherEntityWithNeighbours | undefined => {
	// Check if the key is provided
	if (!key) {
		console.warn('getLayerMetadataByRenderingLayerKey: rendering layer key is undefined');
		return undefined;
	}

	// Get the rendering layer by key
	const renderingLayer = state.renderingLayers.find((renderingLayer) => renderingLayer.key === key);
	if (!renderingLayer) return undefined;

	// Retrieve neighbor keys of the rendering layer
	const renderingLayerNeighbourKeys = renderingLayer.datasource?.neighbours;
	if (!renderingLayerNeighbourKeys || renderingLayerNeighbourKeys.length === 0) return undefined;

	// Get all layers from the state
	const layers = getAllLayers(state);
	if (!layers || layers.length === 0) return undefined;

	// Find the layer by neighbor keys
	return layers.find((layer) => renderingLayerNeighbourKeys.includes(layer.key));
};
