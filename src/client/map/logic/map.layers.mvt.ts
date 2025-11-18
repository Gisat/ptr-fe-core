import { MVTLayer } from '@deck.gl/geo-layers';
import { LayerGeneralProps } from './map.layers.models';
import { validateDatasource } from './validate.layers';
import { UsedDatasourceLabels } from '@gisatcz/ptr-be-core/browser';

/**
 * Creates an MVT (Mapbox Vector Tile) layer using DeckGL.
 *
 * @param {LayerGeneralProps} param0 - The properties for creating the MVT layer.
 * @param {Object} param0.sourceNode - The source node containing configuration and data.
 * @param {boolean} param0.isActive - Determines if the layer is visible.
 * @param {string} param0.key - layer identifier
 * @param {number} param0.opacity - Layer opacity
 * @param {Function} [param0.onClickHandler] - Optional handler function to be called when a feature is clicked.
 * @returns {MVTLayer} The created MVT layer.
 *
 * @throws {Error} If the canvas element is not found during hover events.
 */
export const createMVTLayer = ({ sourceNode, isActive, onClickHandler, key, opacity }: LayerGeneralProps) => {
	const { url } = validateDatasource(sourceNode, UsedDatasourceLabels.MVT, true);

	// build DeckGL layer
	const layer = new MVTLayer({
		id: key,
		visible: isActive,
		opacity: opacity ?? 1,
		data: url,
		minZoom: 0,
		maxZoom: 16,
		getLineColor: [0, 0, 200, 255],
		getFillColor: [0, 0, 255, 255],
		pointRadiusScale: 10,
		pointRadiusMinPixels: 2,
		pointRadiusMaxPixels: 5,
		getElevation: (d) => d.properties.height, // Example of how to use properties from the vector tile
		pickable: true,
		onHover: ({ object }) => {
			const canvas = document.querySelector('canvas');
			if (!canvas) throw new Error('MSV Rendering: Missing canvas');

			if (object) {
				canvas.style.cursor = 'pointer'; // Change cursor when hovering over a point
			} else {
				canvas.style.cursor = 'default'; // Reset cursor when not hovering
			}
		},
		onClick: (info) => {
			if (!onClickHandler) return;

			const geojsonObject = info.object;
			const attributes = geojsonObject.properties;
			onClickHandler(attributes, null);
		},
	});

	return layer;
};
