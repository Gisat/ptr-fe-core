import React, { useEffect, useMemo } from 'react';
import { _WMSLayer as WMSLayer } from '@deck.gl/geo-layers';
import { Layer } from '@deck.gl/core';
import { LayerSourceProps } from './LayerManager';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';

/**
 * A React component that creates and manages a WMS (Web Map Service) layer.
 * This component uses the `@deck.gl/geo-layers` library to render the WMS layer.
 *
 * @param {LayerSourceProps} props - The props for the WMSLayerSource component.
 * @param {RenderingLayer} props.layer - The layer configuration object.
 * @param {(id: string, instance: Layer | null) => void} props.onLayerUpdate - Callback to handle updates to the layer instance.
 * @returns {null} This component does not render any DOM elements.
 */
export const WMSLayerSource = React.memo(({ layer, onLayerUpdate }: LayerSourceProps) => {
	const { isActive, key, opacity, datasource } = layer;
	const { url, configuration } = datasource;

	// Ensure the URL is provided in the datasource
	if (!url) {
		throw new Error(`WMSLayerSource: Missing url in datasource: ${key}`);
	}

	// Parse the datasource configuration
	const config = parseDatasourceConfiguration(configuration);
	if (!config) {
		throw new Error(`WMSLayerSource: Missing configuration in datasource: ${key}`);
	}

	// Extract sublayers from the parsed configuration
	const sublayers = config?.sublayers;
	if (!sublayers) {
		console.warn(`WMSLayerSource: Missing sublayers in datasource configuration: ${key}`);
	}

	/**
	 * Memoize the creation of the WMS layer instance to avoid unnecessary re-renders.
	 * The layer instance is recreated only when its dependencies change.
	 */
	const layerInstance: Layer = useMemo(() => {
		return new WMSLayer({
			id: key,
			visible: isActive,
			data: url,
			minZoom: 0,
			maxZoom: 16,
			opacity: opacity ?? 1,
			layers: sublayers,
			serviceType: 'wms',
		});
		/* TODO: Since sublayers are derived from configuration, which originally is a string
			   (from ptr-be-core model HasConfiguration) and later parsed to an object,
			   we need to stringify it here to avoid infinite render loops due to object reference changes. */
	}, [url, isActive, key, opacity, JSON.stringify(sublayers)]);

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
