import React, { useEffect, useMemo } from 'react';
import { BitmapLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { LayerSourceProps } from './LayerManager';

/**
 * A React component that creates and manages an XYZ tile layer.
 * This component uses the `TileLayer` from `@deck.gl/geo-layers` to render tiles
 * and the `BitmapLayer` to render individual tile images.
 *
 * @param {LayerSourceProps} props - The props for the XYZLayerSource component.
 * @param {RenderingLayer} props.layer - The layer configuration object.
 * @param {(id: string, instance: TileLayer<ImageBitmap> | null) => void} props.onLayerUpdate - Callback to handle updates to the layer instance.
 * @returns {null} This component does not render any DOM elements.
 */
export const XYZLayerSource = React.memo(({ layer, onLayerUpdate }: LayerSourceProps) => {
	// Destructure properties from the layer configuration
	const { isActive, key, opacity, datasource } = layer;

	// Extract the URL from the datasource
	const url = datasource?.url;
	if (!url) {
		throw new Error(`XYZLayerSource: Missing url in datasource: ${key}`);
	}

	/**
	 * Memoize the creation of the TileLayer instance to avoid unnecessary re-renders.
	 * The layer instance is recreated only when its dependencies change.
	 */
	const layerInstance: TileLayer<ImageBitmap> = useMemo(() => {
		return new TileLayer<ImageBitmap>({
			id: key,
			visible: isActive,
			opacity: opacity ?? 1,
			data: url,
			minZoom: 0,
			maxZoom: 19, // Possibly higher zoom levels can be supported in the future
			tileSize: 256,
			maxRequests: 20,
			pickable: true,
			/**
			 * Function to render sublayers for each tile.
			 * Creates a `BitmapLayer` for rendering the tile image.
			 *
			 * @param {Object} props - Properties for the sublayer.
			 * @param {Object} props.tile - The tile object containing bounding box information.
			 * @param {Array} props.tile.boundingBox - The bounding box of the tile as [[west, south], [east, north]].
			 * @param {string} props.data - The URL of the tile image.
			 * @returns {BitmapLayer[]} An array containing the `BitmapLayer` for the tile.
			 */
			renderSubLayers: (props) => {
				const [[west, south], [east, north]] = props.tile.boundingBox;
				const { data, ...otherProps } = props;

				return [
					new BitmapLayer(otherProps, {
						image: data,
						bounds: [west, south, east, north],
					}),
				];
			},
		});
	}, [url, isActive, key, opacity]);

	/**
	 * Effect hook to handle layer updates.
	 * The `onLayerUpdate` callback is called with the layer instance when the component mounts
	 * and with `null` when the component unmounts.
	 */
	useEffect(() => {
		onLayerUpdate(key, layerInstance);
		return () => onLayerUpdate(key, null); // Cleanup on unmount
	}, [layerInstance, key, onLayerUpdate]);

	// This component does not render any DOM elements
	return null;
});
