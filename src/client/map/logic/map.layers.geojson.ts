import { GeoJsonLayer } from '@deck.gl/layers';
import { LayerGeneralProps } from './map.layers.models';
import { validateDatasource } from './validate.layers';
import { UsedDatasourceLabels } from '@gisatcz/ptr-be-core/browser';
import { getFeatureId } from '../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../shared/helpers/hexToRgbArray';
import { SELECTION_DEFAULT_COLOUR } from '../../shared/constants/colors';

/**
 * Represents the structure needed for feature identification and property access.
 */
interface Feature {
	type: 'Feature';
	id?: string;
	properties?: { [key: string]: string };
}

/**
 * Default layer style for GeoJsonLayer rendering.
 */
const defaultLayerStyle = {
	filled: true,
	stroked: true,
	pickable: false,
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
 * @param {string} param0.key - Layer identifier.
 * @param {number} param0.opacity - Layer opacity.
 * @param {Object} param0.selection - Selection object containing featureKeys, distinctColours, and featureKeyColourIndexPairs.
 * @returns {GeoJsonLayer} The created GeoJsonLayer instance.
 *
 * @todo This is only a first draft of the GeoJSON layer implementation.
 *       TODO: Add support for fill styling, point sizes, and other styling options.
 *       TODO: featureIdProperty should be defined and validated in the datasource configuration, not just in geojsonOptions.
 */
export const createGeojsonLayer = ({
	sourceNode,
	isActive,
	isInteractive,
	key,
	opacity,
	selection,
}: LayerGeneralProps) => {
	const { url, configurationJs } = validateDatasource(sourceNode, UsedDatasourceLabels.Geojson, true);

	const selectedFeatureKeys = selection?.featureKeys ?? [];
	const distinctColours = selection?.distinctColours ?? [SELECTION_DEFAULT_COLOUR];
	const featureKeyColourIndexPairs = selection?.featureKeyColourIndexPairs ?? {};

	const geojsonOptions = configurationJs?.geojsonOptions ?? {};
	const layerStyle = geojsonOptions?.layerStyle ?? defaultLayerStyle;

	/**
	 * Returns the line color for a feature.
	 * If the feature is selected, returns its assigned color; otherwise, returns the default.
	 *
	 * @param {Feature} feature - The GeoJSON feature object.
	 * @returns {number[]} The RGBA color array for the feature's line.
	 */
	function getLineColor(feature: Feature): number[] {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			const colourIndex = featureKeyColourIndexPairs[featureId];
			const hex = distinctColours[colourIndex] ?? distinctColours[0];
			// Convert hex to RGB array and add alpha channel
			return [...hexToRgbArray(hex), 255];
		}
		return layerStyle.getLineColor;
	}

	/**
	 * Returns the line width for a feature.
	 * If the feature is selected, returns a thicker line; otherwise, returns the default.
	 *
	 * @param {Feature} feature - The GeoJSON feature object.
	 * @returns {number} The width of the feature's line.
	 */
	function getLineWidth(feature: Feature): number {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			return 20;
		}
		return layerStyle.getLineWidth;
	}

	return new GeoJsonLayer({
		id: key,
		opacity: opacity ?? 1,
		visible: isActive,
		data: url,
		updateTriggers: {
			getLineColor: [layerStyle, selection],
			getFillColor: [layerStyle, selection],
			pickable: [layerStyle, isInteractive],
		},
		...layerStyle,
		getLineColor,
		getLineWidth,
		pickable: isInteractive ?? layerStyle.pickable,
	});
};
