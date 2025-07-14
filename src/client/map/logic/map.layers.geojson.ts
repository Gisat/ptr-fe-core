import { GeoJsonLayer } from '@deck.gl/layers';
import { LayerGeneralProps } from './map.layers.models';
import { validateDatasource } from './validate.layers';
import { UsedDatasourceLabels } from '../../../globals/shared/panther/enums.panther';

const defaultOptions = {
	filled: true,
	stroked: true,
	pointRadiusScale: 0.2,
	getPointRadius: 50,
	getFillColor: [255, 100, 100],
	getLineColor: [255, 100, 100],
};

/**
 * Creates a GeoJsonLayer with the specified properties.
 *
 * @param {LayerGeneralProps} param0 - The properties for creating the GeoJsonLayer.
 * @param {Object} param0.sourceNode - The source node containing configuration and key.
 * @param {boolean} param0.isActive - A flag indicating whether the layer is active.
 * @param {string} param0.key - Layer identifier
 * @param {number} param0.opacity - Layer opacity
 * @returns {GeoJsonLayer} The created GeoJsonLayer instance.
 */
export const createGeojsonLayer = ({ sourceNode, isActive, key, opacity }: LayerGeneralProps) => {
	const { url, configurationJs } = validateDatasource(sourceNode, UsedDatasourceLabels.Geojson, true);

	const geojsonOptions = configurationJs?.geojsonOptions ?? defaultOptions;

	const layer = new GeoJsonLayer({
		id: key,
		opacity: opacity ?? 1,
		visible: isActive,
		data: url,
		...geojsonOptions,
	});

	return layer;
};
