import { RenderingLayer } from '../../shared/models/models.layers';
import { LayerGeneralProps } from './map.layers.models';
import { createGeojsonLayer } from './map.layers.geojson';
import { createTileLayer } from './map.layers.tile';
import { createMVTLayer } from './map.layers.mvt';
import { createWMSLayer } from './map.layers.wms';
import { LayerTreeInteraction } from '../../shared/layers/models.layers';
import { UsedDatasourceLabels } from '@gisatcz/ptr-be-core/browser';
import { createCogLayer } from '../logic/map.layers.cog';
import { Selection } from 'src/client/shared/models/models.selections';

/**
 * Props for parseLayersFromSharedState function.
 */
export interface ParseLayersProps {
	sharedStateLayers: RenderingLayer[];
	getSelectionForLayer?: (selectionKey: string) => Selection | undefined;
	interactionRenderingMap?: Map<LayerTreeInteraction, any>;
}

/**
 * Parses rendering layers from shared state and returns an array of DeckGL layers.
 * Uses a selector callback to retrieve selection objects for each layer.
 *
 * @param {ParseLayersProps} props - Object containing all parameters.
 * @param {RenderingLayer[]} props.sharedStateLayers - Array of rendering layers from shared state.
 * @param {(selectionKey: string) => Selection | undefined} [props.getSelectionForLayer] - Optional callback to get selection for a layer by selectionKey.
 * @param {Map<LayerTreeInteraction, any>} [props.interactionRenderingMap] - Optional map for interaction handlers.
 * @returns {any[]} Array of DeckGL layers.
 */
export const parseLayersFromSharedState = ({
	sharedStateLayers,
	getSelectionForLayer,
	interactionRenderingMap,
}: ParseLayersProps) => {
	const layerSwitch = (layer: RenderingLayer) => {
		// Gets the selection object for the current layer
		const selectionForLayer =
			layer.selectionKey && getSelectionForLayer ? getSelectionForLayer(layer.selectionKey) : undefined;

		const layerProps: LayerGeneralProps = {
			style: null, // TODO: Implement style for layers
			sourceNode: layer.datasource,
			key: layer.key,
			opacity: layer.opacity,
			isActive: layer.isActive ?? true,
			isInteractive: layer.isInteractive,
			onClickHandler: layer.interaction && interactionRenderingMap?.get(layer.interaction),
			selection: selectionForLayer,
			route: layer.route,
		};

		// TODO: add other layer types and datasources
		if (layer.datasource.labels.includes(UsedDatasourceLabels.XYZ)) return createTileLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.MVT)) return createMVTLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.WMS)) return createWMSLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.Geojson)) return createGeojsonLayer(layerProps);
		else if (layer.datasource.labels.includes(UsedDatasourceLabels.COG)) return createCogLayer(layerProps);
		else throw new Error(`Datasource Error - Unknown datasource type ${layer.datasource.labels}`);
	};
	return sharedStateLayers.map((source: RenderingLayer) => layerSwitch(source));
};
