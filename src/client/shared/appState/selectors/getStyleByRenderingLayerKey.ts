import { AppSharedState } from '../../appState/state.models';
import { Style } from '../../../../globals/shared/panther/models.nodes';
import { getAllLayers } from './getAllLayers';

/**
 * Retrieves a style for rendering layer.
 *
 * @param {AppSharedState} state - The application state containing places and rendering layers.
 * @param {string | undefined} layerKey - The key of the layer for which places are to be retrieved.
 * @returns {Style | undefined} - Style model
 */
export const getStyleByRenderingLayerKey = (state: AppSharedState, layerKey: string | undefined): Style | undefined => {
	// get rendering layer neighbour keys
	const renderingLayer = state.renderingLayers.find((renderingLayer) => renderingLayer.key === layerKey);
	if (!renderingLayer) return undefined;

	// find neighbours of the rendering layer
	const renderingLayerNeighbourKeys = renderingLayer.datasource?.neighbours;
	if (!renderingLayerNeighbourKeys || renderingLayerNeighbourKeys.length === 0) return undefined;

	// get all layers from state
	const layers = getAllLayers(state);

	// find layer by renderingLayerNeighbourKeys
	const layer = layers.find((layer) => renderingLayerNeighbourKeys.includes(layer.key));
	if (!layer) return undefined;

	// find layer neighbour keys
	const layerNeighbourKeys = layer.neighbours;
	if (!layerNeighbourKeys || layerNeighbourKeys.length === 0) return undefined;

	// find style by layer neighbour keys
	return state.styles.find((style) => layerNeighbourKeys.includes(style.key));
};
