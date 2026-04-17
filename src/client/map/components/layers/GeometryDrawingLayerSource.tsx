import { useEffect } from 'react';
import { CompositeLayer } from '@deck.gl/core';
import { LayerSourceProps } from './LayerManager';
import { geometryLayer } from '../../GeometryDrawing/_layers/geometryLayer';
import { GeometryDrawingModel } from '../../../shared/models/models.layers';

/**
 * A deck.gl CompositeLayer that delegates rendering to {@link geometryLayer}.
 * Acts as a bridge so that the geometry drawing sub-layers
 * (vertices, edges, fill, radius line, …) can be managed as a single
 * layer instance inside the standard LayerManager pipeline.
 */
class DrawCompositeLayer extends CompositeLayer<any> {
	renderLayers() {
		return geometryLayer(this.props as any);
	}
}

/**
 * Layer source for polygon / circle drawing.
 *
 * Reads `geometryDrawing` state from the rendering layer definition,
 * wraps it in a {@link DrawCompositeLayer} and registers the resulting
 * deck.gl layer instance via `onLayerUpdate` so that LayerManager can
 * include it in the standard layer stack.
 *
 * Renders no DOM – returns `null`.
 *
 * @param {LayerSourceProps} props – Standard layer-source props provided by LayerManager.
 */
export const GeometryDrawingLayerSource = ({
	layer,
	onLayerUpdate,
	viewport,
}: LayerSourceProps) => {
	const drawingState: GeometryDrawingModel | undefined =
		layer.geometryDrawing;

	useEffect(() => {
		if (drawingState) {
			const zoom = viewport?.zoom;
			const compositeLayer = new DrawCompositeLayer({
				id: layer.key,
				...drawingState,
				zoom,
				// Ensure updates are triggered when properties change
				updateTriggers: {
					// We can trigger update on specific props, or just rely on new instance creation
					// containing new props.
					...drawingState,
					zoom,
				},
			});
			onLayerUpdate(layer.key, compositeLayer);
		} else {
			onLayerUpdate(layer.key, null);
		}
	}, [layer.key, drawingState, onLayerUpdate, viewport?.zoom]);

	return null;
};
