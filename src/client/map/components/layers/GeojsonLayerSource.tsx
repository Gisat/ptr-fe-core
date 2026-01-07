import React, { useEffect, useMemo } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { SELECTION_DEFAULT_COLOUR } from '../../../shared/constants/colors';
import { getFeatureId } from '../../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../../shared/helpers/hexToRgbArray';
import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getSelectionByKey } from '../../../shared/appState/selectors/getSelectionByKey';
import { useAxios } from '../../../shared/hooks/useAxios';
import { LayerSourceProps } from './LayerManager';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';

/**
 * Represents the structure needed for feature identification and property access.
 */
interface Feature {
	type: 'Feature';
	id?: string;
	properties?: { [key: string]: string };
}

/**
 * Default layer style for GeoJsonLayer rendering.
 */
const defaultLayerStyle = {
	filled: true,
	stroked: true,
	pickable: false,
	pointRadiusScale: 0.2,
	getPointRadius: 50,
	getFillColor: [255, 255, 255],
	getLineColor: [0, 0, 0, 100],
	getLineWidth: 1,
	lineWidthUnits: 'pixels' as const,
};

/**
 * A React component that creates and manages a GeoJSON layer.
 * This component uses the `GeoJsonLayer` from `@deck.gl/layers` to render GeoJSON data.
 *
 * @param {LayerSourceProps} props - The props for the GeojsonLayerSource component.
 * @param {RenderingLayer} props.layer - The layer configuration object.
 * @param {(id: string, instance: GeoJsonLayer | null) => void} props.onLayerUpdate - Callback to handle updates to the layer instance.
 * @returns {null} This component does not render any DOM elements.
 */
export const GeojsonLayerSource = React.memo(({ layer, onLayerUpdate }: LayerSourceProps) => {
	const [sharedState] = useSharedState();
	const { isActive, key, opacity, datasource, isInteractive, selectionKey, route } = layer;
	const { url, documentId, validIntervalIso, configuration } = datasource;

	// TODO url parameter should be optional and not needed if the data comes from the data service
	if (!url) {
		throw new Error(`GeojsonLayerSource: Missing url in datasource: ${key}`);
	}

	// Log a warning if the documentId is missing
	if (!documentId) {
		console.warn(`GeojsonLayerSource: Missing documentId in datasource: ${key}`);
	}

	// Parse the datasource configuration
	const config = parseDatasourceConfiguration(configuration);
	if (!config) {
		console.warn(`GeojsonLayerSource: Missing configuration in datasource: ${key}`);
	}

	// Extract GeoJSON options from the parsed configuration
	const geojsonOptions = config?.geojsonOptions;
	if (!geojsonOptions) {
		console.warn(`GeojsonLayerSource: Missing geojsonOptions in datasource configuration: ${key}`);
	}

	// Layer style
	const layerStyle = geojsonOptions?.layerStyle ?? defaultLayerStyle;

	// Selection
	const selection = selectionKey ? getSelectionByKey(sharedState, selectionKey) : null;
	const selectedFeatureKeys = selection?.featureKeys ?? [];
	const distinctColours = selection?.distinctColours ?? [SELECTION_DEFAULT_COLOUR];
	const featureKeyColourIndexPairs = selection?.featureKeyColourIndexPairs ?? {};

	// Load the data from route
	let {
		data: fetchedData,
		error,
		isLoading,
	} = useAxios(
		{ fetchUrl: route ?? '/api/features' }, // if no route is provided, use default
		undefined,
		{ documentId: documentId, validIntervalIso, url },
		{ method: 'POST' }
	);

	// While data is loading, do not render the layer
	if (isLoading) {
		// Handle loading state if necessary
	}

	// Log an error if data fetching fails
	if (error) {
		// just warning for now due to backward compatibility for apps which not using route for geojson fetching
		console.warn('Error loading map data:', error);
	}

	// Determine the data source for the layer
	const data = !error ? fetchedData : url;

	/**
	 * Returns the line color for a feature.
	 * If the feature is selected, returns its assigned color; otherwise, returns the default.
	 *
	 * @param {Feature} feature - The GeoJSON feature object.
	 * @returns {number[]} The RGBA color array for the feature's line.
	 */
	function getLineColor(feature: Feature): number[] {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			const colourIndex = featureKeyColourIndexPairs[featureId];
			const hex = distinctColours[colourIndex] ?? distinctColours[0];
			// Convert hex to RGB array and add alpha channel
			return [...hexToRgbArray(hex), 255];
		}
		return layerStyle.getLineColor;
	}

	/**
	 * Returns the line width for a feature.
	 * If the feature is selected, returns a thicker line; otherwise, returns the default.
	 *
	 * @param {Feature} feature - The GeoJSON feature object.
	 * @returns {number} The width of the feature's line.
	 */
	function getLineWidth(feature: Feature): number {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			return 5;
		}
		return layerStyle.getLineWidth;
	}

	/**
	 * Memoize the creation of the GeoJsonLayer instance to avoid unnecessary re-renders.
	 * The layer instance is recreated only when its dependencies change.
	 */
	const layerInstance: GeoJsonLayer | null = useMemo(() => {
		// Do not render layer if data is still loading and we expect fetched data, or if there's no data at all.
		if ((isLoading && !error) || !data) {
			return null;
		}

		return new GeoJsonLayer({
			id: key,
			opacity: opacity ?? 1,
			visible: isActive,
			data,
			updateTriggers: {
				getLineColor: [layerStyle, selection],
				getFillColor: [layerStyle, selection],
				getLineWidth: [layerStyle, selection],
				pickable: [layerStyle, isInteractive],
			},
			...layerStyle,
			getLineColor,
			getLineWidth,
			pickable: isInteractive ?? layerStyle.pickable,
		});
	}, [isActive, key, opacity, isInteractive, layerStyle, selection, data, geojsonOptions, isLoading, error]);

	/**
	 * Effect hook to handle layer updates.
	 * The `onLayerUpdate` callback is called with the layer instance when the component mounts
	 * and with `null` when the component unmounts.
	 */
	useEffect(() => {
		onLayerUpdate(key, layerInstance);
		return () => onLayerUpdate(key, null); // cleanup on unmount
	}, [layerInstance, key, onLayerUpdate]);

	// This component does not render any DOM elements
	return null;
});
