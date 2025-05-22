import geolib from '@gisatcz/deckgl-geolib';
import { LayerGeneralProps } from '../logic/map.layers.models';
import { validateDatasource } from '../logic/validate.layers';
import { UsedDatasourceLabels } from '../../../globals/shared/panther/enums.panther';

const CogBitmapLayer = geolib.CogBitmapLayer;

/**
 * Creates a COG (Cloud Optimized GeoTIFF) layer for rendering raster data on a map using @gisatcz/deckgl-geolib library
 *
 * @param {LayerGeneralProps} props - The properties required to create the COG layer.
 * @param {Object} props.sourceNode - The source node containing the data configuration.
 * @param {boolean} props.isActive - Determines if the layer is visible on the map.
 * @param {string} props.key - A unique identifier for the layer.
 * @param {number} [props.opacity=1] - The opacity of the layer, defaults to 1 if not provided.
 * @returns {CogBitmapLayer} - An instance of the CogBitmapLayer configured with the provided properties.
 */
export const createCogLayer = ({ sourceNode, isActive, key, opacity }: LayerGeneralProps) => {
	// Validate the datasource and retrieve its configuration.
	const { configurationJs } = validateDatasource(sourceNode, UsedDatasourceLabels.COG, true);

	// Create and return a new CogBitmapLayer with the specified properties.
	const layer = new CogBitmapLayer({
		id: key,
		rasterData: configurationJs.url,
		isTiled: true,
		opacity: opacity ?? 1,
		visible: isActive,
		cogBitmapOptions: configurationJs.cogBitmapOptions,
	});
	return layer;
};
