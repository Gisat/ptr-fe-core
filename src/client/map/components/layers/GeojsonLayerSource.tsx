import React, { useEffect, useMemo, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import { SELECTION_DEFAULT_COLOUR } from '../../../shared/constants/colors';
import { getFeatureId } from '../../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../../shared/helpers/hexToRgbArray';
import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getSelectionByKey } from '../../../shared/appState/selectors/getSelectionByKey';
import { useAxios } from '../../../shared/hooks/useAxios';
import { LayerSourceProps } from './LayerManager';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { MapFeature } from '../../../shared/models/models.mapFeature';
import { getFeatureCentroid } from '../../../shared/helpers/getFeatureCentroid';
import { getLayerTooltip } from '../../MapSet/MapTooltip/getLayerTooltip';
import { TooltipType } from '../../../shared/models/models.tooltip';

/** What our API returns when we call the route. */
export interface GeojsonFeatureCollection {
	type: 'FeatureCollection';
	features: MapFeature[];
}

/** All shapes we *might* pass to deck.gl GeoJsonLayer `data` prop. */
type DeckGeoJsonData = string | GeojsonFeatureCollection | MapFeature | MapFeature[];
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
 * It also integrates tooltip functionality for hover, click, and selection-based tooltips.
 *
 * @param {LayerSourceProps} props - The props for the GeojsonLayerSource component.
 * @param {RenderingLayer} props.layer - The layer configuration object.
 * @param {(id: string, instance: GeoJsonLayer | null) => void} props.onLayerUpdate - Callback to handle updates to the layer instance.
 * @returns {null} This component does not render any DOM elements.
 */
export const GeojsonLayerSource = React.memo(({ layer, onLayerUpdate, viewport, CustomTooltip }: LayerSourceProps) => {
	const [sharedState] = useSharedState();
	const { isActive, key, opacity, datasource, isInteractive, selectionKey, fetchOptions } = layer;
	const { url, documentId, validIntervalIso, configuration } = datasource;
	const route = fetchOptions?.route;
	const method = fetchOptions?.method;

	// Hover info for hover-based tooltip
	const [featureInfo, setFeatureInfo] = useState<{ feature: MapFeature; x: number; y: number } | null>(null);

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

	// Tooltip settings from geojsonOptions (styling & behavior)
	const tooltipSettings = geojsonOptions?.tooltipSettings;
	const tooltipType = tooltipSettings?.type || (CustomTooltip ? TooltipType.Hover : TooltipType.Native);
	const tooltipEnabled = !geojsonOptions?.disableTooltip;

	// Load the data from route
	const {
		data: fetchedData,
		error,
		isLoading,
	} = useAxios<DeckGeoJsonData>(
		{ fetchUrl: route },
		undefined,
		{ documentId, validIntervalIso, url },
		{ method, skip: !route }
	);

	/**
	 * DATA LOGIC:
	 * 1. If route is provided and data is successfully fetched, use fetchedData.
	 * 2. If no route is provided OR there is an error fetching from the route, fallback to url.
	 */
	const data = route && fetchedData && !error ? fetchedData : url;

	// Always normalize to an array for features used in selection & tooltips
	let features: MapFeature[] = [];

	if (Array.isArray(data)) {
		// Array of features
		features = data as MapFeature[];
	}
	if (typeof data === 'object' && data !== null) {
		if (
			(data as GeojsonFeatureCollection).type === 'FeatureCollection' &&
			Array.isArray((data as GeojsonFeatureCollection).features)
		) {
			features = (data as GeojsonFeatureCollection).features;
		}
		if ((data as MapFeature).type === 'Feature') {
			features = [data as MapFeature];
		}
	}

	// We only show "loading" if we are actively trying to fetch from a route and haven't failed yet
	const isDataLoading = !!route && isLoading && !error;

	/**
	 * Returns the line color for a feature.
	 * If the feature is selected, returns its assigned color; otherwise, returns the default.
	 *
	 * @param {Feature} feature - The GeoJSON feature object.
	 * @returns {number[]} The RGBA color array for the feature's line.
	 */
	function getLineColor(feature: MapFeature): number[] {
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
	function getLineWidth(feature: MapFeature): number {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			return 5;
		}
		return layerStyle.getLineWidth;
	}

	// ---------- Tooltip creation ----------
	/**
	 * Compute tooltip React node based on:
	 * - hover/click featureInfo (screen-space tooltip)
	 * - or selection + viewport + getFeatureCentroid (map-space tooltip)
	 */
	const tooltip =
		tooltipEnabled &&
		getLayerTooltip({
			tooltipSettings,
			featureInfo,
			data: features,
			selection,
			viewport,
			CustomTooltip,
			// For GeoJSON geometries, always use a centroid / representative point.
			getCoordinates: (selectedFeature: MapFeature) => getFeatureCentroid(selectedFeature),
		});

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
			/**
			 * Hover handler:
			 * - updates `featureInfo` only when hover tooltips are enabled and active
			 * - cleared when nothing is hovered or tooltips are disabled
			 */
			onHover: (info) => {
				if (!tooltipEnabled || tooltipType !== TooltipType.Hover) return;
				if (info.object && info.x != null && info.y != null) {
					setFeatureInfo({ feature: info.object as MapFeature, x: info.x, y: info.y });
				} else {
					setFeatureInfo(null);
				}
			},

			/**
			 * Click handler:
			 * - toggles `featureInfo` when click tooltips are enabled and active
			 * - clicking the same feature again hides the tooltip
			 */
			onClick: (info) => {
				if (!tooltipEnabled || tooltipType !== TooltipType.Click) return;

				const clickedFeature = info.object as MapFeature | null;
				if (!clickedFeature || info.x == null || info.y == null) {
					setFeatureInfo(null);
					console.warn('GeojsonLayerSource: onClick handler - clickedFeature is null.');
					return;
				}

				const currentId = featureInfo ? getFeatureId(featureInfo.feature, geojsonOptions?.featureIdProperty) : null;
				const clickedId = getFeatureId(clickedFeature, geojsonOptions?.featureIdProperty);

				// If same feature clicked again (by id), toggle tooltip off
				if (currentId && clickedId && currentId === clickedId) {
					setFeatureInfo(null);
				} else {
					setFeatureInfo({ feature: clickedFeature, x: info.x, y: info.y });
				}
			},

			/**
			 * Drag handler:
			 * - clears tooltip state when map is dragged to avoid stale positions.
			 */
			onDrag: () => {
				if (tooltipEnabled) {
					setFeatureInfo(null);
				}
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
	return tooltip;
});
