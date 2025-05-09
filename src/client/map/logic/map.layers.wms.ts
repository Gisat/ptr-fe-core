import { LayerGeneralProps } from './map.layers.models';
import { _WMSLayer as WMSLayer } from '@deck.gl/geo-layers';
import { validateDatasource } from './validate.layers';
import { UsedDatasourceLabels } from '../../shared/panther/enums.panther';

/**
 * Creates a WMS (Web Map Service) layer using the provided source node and activation status.
 *
 * @param {LayerGeneralProps} param0 - The properties for creating the WMS layer.
 * @param {Object} param0.sourceNode - The source node containing configuration and key.
 * @param {boolean} param0.isActive - The activation status of the layer.
 * @param {string} param0.key - layer identifier
 * @param {number} param0.opacity - Layer opacity
 * @returns {WMSLayer} The created WMS layer.
 * @throws {Error} If the configuration does not contain sublayers.
 */
export const createWMSLayer = ({ sourceNode, isActive, key, opacity }: LayerGeneralProps) => {
	const { configurationJs } = validateDatasource(sourceNode, UsedDatasourceLabels.WMS, true);

	if (!configurationJs.sublayers) throw new Error(`WMS Layer error: WMS requires sublayers in configuration`);

	// build DeckGL layer
	const layer = new WMSLayer({
		id: key,
		visible: isActive,
		data: configurationJs.url,
		minZoom: 0,
		maxZoom: 16,
		opacity: opacity ?? 1,
		layers: configurationJs.sublayers,
		serviceType: 'wms',
	});

	return layer;
};
