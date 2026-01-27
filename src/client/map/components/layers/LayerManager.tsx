import { UsedDatasourceLabels } from '@gisatcz/ptr-be-core/browser';
import { MVTLayer, TileLayer, _WMSLayer as WMSLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import { Layer, Viewport } from '@deck.gl/core';
import { RenderingLayer } from '../../../shared/models/models.layers';
import { XYZLayerSource } from './XYZLayerSource';
import { COGLayerSource } from './COGLayerSource';
import { GeojsonLayerSource } from './GeojsonLayerSource';
import { WMSLayerSource } from './WMSLayerSource';
import { IconLayerSource } from './IconLayerSource';

/**
 * Represents the possible types of layer instances that can be managed.
 * This includes specific layer types from the `deck.gl` library.
 */
export type LayerInstance = TileLayer<ImageBitmap> | GeoJsonLayer | WMSLayer | MVTLayer | Layer | null;

/**
 * Props for the `LayerManager` component.
 * @property {RenderingLayer[]} layers - Array of layers to be rendered and managed.
 * @property {(id: string, instance: LayerInstance) => void} onLayerUpdate - Callback function to handle updates to layer instances.
 */
interface LayerManagerProps {
	layers: RenderingLayer[];
	onLayerUpdate: (id: string, instance: LayerInstance) => void;
	viewport: Viewport | null;
	CustomTooltip?: React.ElementType | boolean;
}

/**
 * Props for individual layer source components.
 * @property {RenderingLayer} layer - The configuration object for the layer.
 * @property {(id: string, instance: LayerInstance) => void} onLayerUpdate - Callback function to handle updates to the layer instance.
 */
export interface LayerSourceProps {
	layer: RenderingLayer;
	onLayerUpdate: (id: string, instance: LayerInstance) => void;
	viewport?: Viewport | null;
	CustomTooltip?: React.ElementType | boolean;
}

/**
 * The `LayerManager` component is responsible for rendering and managing multiple layers.
 * It dynamically selects the appropriate layer source component based on the datasource labels.
 *
 * @param {LayerManagerProps} props - The props for the `LayerManager` component.
 * @returns {JSX.Element} A React fragment containing the rendered layer components.
 */
export const LayerManager = ({ layers, onLayerUpdate, viewport, CustomTooltip }: LayerManagerProps) => {
	return (
		<>
			{layers.map((layer) => {
				// Extract datasource labels from the layer
				const labels: string[] = layer?.datasource?.labels;

				// Log an error if no labels are provided for the layer
				if (!labels?.length) {
					// Log it instead of throwing to keep the React tree stable
					console.error(`Datasource error: Missing labels for layer ${layer.key}`);
					return null;
				}

				// Render the appropriate layer source component based on the datasource labels
				if (labels.includes(UsedDatasourceLabels.XYZ)) {
					return <XYZLayerSource key={layer.key} layer={layer} onLayerUpdate={onLayerUpdate} />;
				} else if (labels.includes(UsedDatasourceLabels.COG)) {
					return <COGLayerSource key={layer.key} layer={layer} onLayerUpdate={onLayerUpdate} />;
				} else if (labels.includes(UsedDatasourceLabels.WMS)) {
					return <WMSLayerSource key={layer.key} layer={layer} onLayerUpdate={onLayerUpdate} />;
				} else if (labels.includes(UsedDatasourceLabels.Geojson)) {
					// Determine the specific layer type for GeoJSON data
					switch (layer.layerType) {
						case 'icon':
							return (
								<IconLayerSource
									key={layer.key}
									layer={layer}
									onLayerUpdate={onLayerUpdate}
									viewport={viewport}
									CustomTooltip={CustomTooltip}
								/>
							);
						case 'geojson':
							return (
								<GeojsonLayerSource
									key={layer.key}
									layer={layer}
									onLayerUpdate={onLayerUpdate}
									viewport={viewport}
									CustomTooltip={CustomTooltip}
								/>
							);
						default:
							return (
								<GeojsonLayerSource
									key={layer.key}
									layer={layer}
									onLayerUpdate={onLayerUpdate}
									viewport={viewport}
									CustomTooltip={CustomTooltip}
								/>
							);
					}
				} else {
					// Log a warning if the datasource type is unknown
					console.warn(`Datasource Warning - Unknown datasource type for layer ${layer.key}`);
					return null;
				}
			})}
		</>
	);
};
