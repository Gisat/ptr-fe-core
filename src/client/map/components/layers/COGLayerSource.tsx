import React, { useEffect, useMemo } from 'react';
import geolib from '@gisatcz/deckgl-geolib';
import { Layer } from '@deck.gl/core';
import { LayerSourceProps } from './LayerManager';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';

const CogBitmapLayer = geolib.CogBitmapLayer;

/**
 * A React component that creates and manages a COG (Cloud Optimized GeoTIFF) layer.
 * This component uses the `CogBitmapLayer` from `@gisatcz/deckgl-geolib` to render raster data.
 *
 * @param {LayerSourceProps} props - The props for the COGLayerSource component.
 * @param {RenderingLayer} props.layer - The layer configuration object.
 * @param {(id: string, instance: Layer | null) => void} props.onLayerUpdate - Callback to handle updates to the layer instance.
 * @returns {null} This component does not render any DOM elements.
 */
export const COGLayerSource = React.memo(({ layer, onLayerUpdate }: LayerSourceProps) => {
	// Destructure properties from the layer configuration
	const { isActive, key, opacity, datasource } = layer;
	const { url, configuration } = datasource;

	// Ensure the URL is provided in the datasource
	if (!url) {
		throw new Error(`COGLayerSource: Missing url in datasource: ${key}`);
	}

	// Parse the datasource configuration
	const config = parseDatasourceConfiguration(configuration);
	if (!config) {
		// Log a warning if the configuration is missing
		console.warn(`COGLayerSource: Missing configuration in datasource: ${key}`);
	}

	// Extract COG bitmap options from the parsed configuration
	const cogBitmapOptions = config?.cogBitmapOptions;
	if (!cogBitmapOptions) {
		// Log a warning if the COG bitmap options are missing
		console.warn(`COGLayerSource: Missing cogBitmapOptions in datasource configuration: ${key}`);
	}

	/**
	 * Memoize the creation of the CogBitmapLayer instance to avoid unnecessary re-renders.
	 * The layer instance is recreated only when its dependencies change.
	 */
	const layerInstance: Layer = useMemo(() => {
		if (!cogBitmapOptions) {
			return null;
		}
		return new CogBitmapLayer({
			id: key,
			rasterData: url,
			isTiled: true,
			opacity: opacity ?? 1,
			visible: isActive,
			cogBitmapOptions,
		});
		/* TODO: Since cogBitmapOptions is derived from configuration, which originally is a string
				   (from ptr-be-core model HasConfiguration) and later parsed to an object,
				   we need to stringify it here to avoid infinite render loops due to object reference changes. */
	}, [url, isActive, key, opacity, JSON.stringify(cogBitmapOptions)]);

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
