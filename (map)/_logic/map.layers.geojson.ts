import { GeoJsonLayer } from "@deck.gl/layers";
import { LayerGeneralProps } from "./map.layers.models";
import { validateDatasource } from "./validate.layers";
import { UsedDatasourceLabels } from "../../(shared)/panther/enums.panther";

/**
 * Creates a GeoJsonLayer with the specified properties.
 *
 * @param {LayerGeneralProps} param0 - The properties for creating the GeoJsonLayer.
 * @param {Object} param0.sourceNode - The source node containing configuration and key.
 * @param {boolean} param0.isActive - A flag indicating whether the layer is active.
 * @returns {GeoJsonLayer} The created GeoJsonLayer instance.
 */
export const createGeojsonLayer = ({ sourceNode, isActive }: LayerGeneralProps) => {

  const { configurationJs } = validateDatasource(sourceNode, UsedDatasourceLabels.Geojson, false)
  const { key } = sourceNode

  const layer = new GeoJsonLayer({
    id: key,
    visible: isActive,
    data: configurationJs.url,
    filled: true,
    stroked: true,
    pointRadiusScale: .2,
    getPointRadius: 50,
    getFillColor: [255, 100, 100],
    getLineColor: [255, 100, 100],
  })

  return layer
}
