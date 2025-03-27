import { TileLayer } from "@deck.gl/geo-layers";
import { LayerGeneralProps } from "./map.layers.models";
import { BitmapLayer } from "@deck.gl/layers";
import { validateDatasource } from "./validate.layers";
import { UsedDatasourceLabels } from "../../(shared)/panther/enums.panther";

/**
 * Creates a TileLayer for DeckGL using the provided source node and activity status.
 *
 * @param {LayerGeneralProps} param0 - The properties for the layer.
 * @param {Object} param0.sourceNode - The source node containing configuration and key.
 * @param {boolean} param0.isActive - Indicates whether the layer is active and visible.
 * @returns {TileLayer<ImageBitmap>} - The created TileLayer instance.
 */
export const createTileLayer = ({ sourceNode, isActive }: LayerGeneralProps) => {

  const { configurationJs } = validateDatasource(sourceNode, UsedDatasourceLabels.XYZ, true)

  const { key } = sourceNode
  // build DeckGL layer
  const layer = new TileLayer<ImageBitmap>({
    id: key,
    visible: isActive,
    data: [configurationJs.url],
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    maxRequests: 20,
    pickable: true,
    renderSubLayers: props => {
      const [[west, south], [east, north]] = props.tile.boundingBox;
      const { data, ...otherProps } = props;

      return [
        new BitmapLayer(otherProps, {
          image: data,
          bounds: [west, south, east, north]
        })
      ];
    }
  })

  return layer
}
