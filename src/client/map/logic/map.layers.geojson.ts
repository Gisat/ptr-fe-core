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
	getLineWidth: 1,
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
export const createGeojsonLayer = ({ sourceNode, isActive, key, opacity, activeFeatureKey }: LayerGeneralProps) => {
	const { url, configurationJs } = validateDatasource(sourceNode, UsedDatasourceLabels.Geojson, true);

	const geojsonOptions = configurationJs?.geojsonOptions ?? defaultOptions;

	const layer = new GeoJsonLayer({
		id: key,
		opacity: opacity ?? 1,
		visible: isActive,
		data: url,
		updateTriggers: {
			getLineColor: [activeFeatureKey],
			getFillColor: [activeFeatureKey],
		},
		...geojsonOptions,
		getLineColor: (feature: any) => {
			if (feature?.properties?.Name && activeFeatureKey && feature?.properties?.Name === activeFeatureKey) {
				return [0, 255, 255, 255]; // blue
			} else {
				return geojsonOptions.getLineColor;
			}
		},
		getLineWidth: (feature: any) => {
			if (feature?.properties?.Name === activeFeatureKey) {
				return 20; // thicker line for highlighted feature
			} else {
				return geojsonOptions.getLineWidth;
			}
		},
	});

	return layer;
};
