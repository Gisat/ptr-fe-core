import { RenderingLayer } from '../../shared/models/models.layers';
import { LayerGeneralProps } from './map.layers.models';
import { createGeojsonLayer } from './map.layers.geojson';
import { createTileLayer } from './map.layers.tile';
import { createMVTLayer } from './map.layers.mvt';
import { createWMSLayer } from './map.layers.wms';
import { LayerTreeInteraction } from '../../shared/layers/models.layers';
import { UsedDatasourceLabels } from '../../../globals/shared/panther/enums.panther';
import { createCogLayer } from '../logic/map.layers.cog';

// TODO: Need better implementation for parsing layers
export const parseLayersFromSharedState = (
	sharedStateLayers: RenderingLayer[],
	interactionRenderingMap?: Map<LayerTreeInteraction, any>
) => {
	const layerSwitch = (layer: RenderingLayer) => {
		const layerProps: LayerGeneralProps = {
			style: null, // TODO: Implement style for layers
			sourceNode: layer.datasource,
			key: layer.key,
			opacity: layer.opacity,
			isActive: layer.isActive ?? true,
			onClickHandler: layer.interaction && interactionRenderingMap?.get(layer.interaction),
		};

		// TODO: add other layer types and datasources
		if (layer.datasource.labels.includes(UsedDatasourceLabels.XYZ)) return createTileLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.MVT)) return createMVTLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.WMS)) return createWMSLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.Geojson)) return createGeojsonLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.COG)) return createCogLayer(layerProps);
		else throw new Error(`Datasource Error - Unknown datasource type ${layer.datasource.labels}`);
	};
	return sharedStateLayers.map((source: RenderingLayer) => {
		return layerSwitch(source);
	});
};
