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
import { Feature } from '../../../shared/models/models.feature';

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
	const { isActive, key, opacity, datasource, isInteractive, selectionKey, fetchOptions } = layer;
	const { url, documentId, validIntervalIso, configuration } = datasource;
	const route = fetchOptions?.route;
	const method = fetchOptions?.method;

	// We need a fallback URL if no route is provided (e.g. external static GeoJSON file)
	if (!url && !route) {
		throw new Error(`GeojsonLayerSource: Missing both route and url in datasource: ${key}`);
	}

	// Log a warning if the documentId is missing
	if (!documentId) {
		console.warn(`GeojsonLayerSource: Missing documentId in datasource: ${key}`);
	}

	// Parse the datasource configuration
	const config = parseDatasourceConfiguration(configuration);

	// Extract GeoJSON options from the parsed configuration
	// TODO geojsonOptions are currently used for styling and featureIdProperty, solve this properly in the future
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
		{ fetchUrl: route },
		undefined,
		{ documentId: documentId, validIntervalIso, url },
		{ method, skip: !route }
	);

	/**
	 * DATA LOGIC:
	 * 1. If route is provided and data is successfully fetched, use fetchedData.
	 * 2. If no route is provided OR there is an error fetching from the route, fallback to url.
	 */
	const data = route && fetchedData && !error ? fetchedData : url;

	// We only show "loading" if we are actively trying to fetch from a route and haven't failed yet
	const isDataLoading = !!route && isLoading && !error;

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
		// Prevent rendering only if we are in the middle of a route fetch.
		// If we have no route, or we have an error, we proceed with 'url' as data.
		if (isDataLoading || !data) {
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
	}, [isActive, key, opacity, isInteractive, layerStyle, selection, data, geojsonOptions, isDataLoading]);

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
