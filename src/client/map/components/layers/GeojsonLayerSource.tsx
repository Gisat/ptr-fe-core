import React, { useEffect, useMemo, useState } from 'react';
import { GeoJsonLayer } from '@deck.gl/layers';
import center from '@turf/center';
import { SELECTION_DEFAULT_COLOUR } from '../../../shared/constants/colors';
import { getFeatureId } from '../../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../../shared/helpers/hexToRgbArray';
import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getSelectionByKey } from '../../../shared/appState/selectors/getSelectionByKey';
import { useAxios } from '../../../shared/hooks/useAxios';
import { LayerSourceProps } from './LayerManager';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { Feature } from '../../../shared/models/models.feature';
import { getTooltipAttributes } from '../../../shared/helpers/getTooltipAttributes';
import { MapTooltip } from '../../MapSet/MapTooltip/MapTooltip';

// Accepts Feature or Geometry, Polygon or MultiPolygon
function getPolygonCenter(feature) {
	let geometry = feature.geometry || feature;
	let polygonFeature;

	if (geometry.type === 'Polygon') {
		polygonFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: geometry.coordinates,
			},
			properties: feature.properties || {},
		};
	} else if (geometry.type === 'MultiPolygon') {
		// Use the first polygon in MultiPolygon for center calculation
		polygonFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: geometry.coordinates[0],
			},
			properties: feature.properties || {},
		};
	} else {
		// Fallback: treat as Point or LineString
		return geometry.coordinates;
	}

	const centerPoint = center(polygonFeature);
	return centerPoint.geometry.coordinates; // [lng, lat]
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
export const GeojsonLayerSource = React.memo(({ layer, onLayerUpdate, viewport, CustomTooltip }: LayerSourceProps) => {
	const [sharedState] = useSharedState();
	const { isActive, key, opacity, datasource, isInteractive, selectionKey, fetchOptions } = layer;
	const { url, documentId, validIntervalIso, configuration } = datasource;
	const route = fetchOptions?.route;
	const method = fetchOptions?.method;

	// Hover info for hover-based tooltip
	const [featureInfo, setFeatureInfo] = useState<{ feature: any; x: number; y: number } | null>(null);

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

	// Tooltip settings
	const tooltipSettings = geojsonOptions?.tooltipSettings;
	const tooltipType = tooltipSettings?.type || 'native'; // 'native' | 'hover' | 'click' | 'selection'

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
	const features = data?.features;

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

	// ---------- Tooltip creation ----------
	let tooltip: React.ReactNode = null;

	if (tooltipSettings && tooltipType !== 'native') {
		const tooltipOffsetX = tooltipSettings?.offsetX || 0;
		const tooltipOffsetY = tooltipSettings?.offsetY || 0;
		const tooltipAttributes = tooltipSettings.attributes || [];

		// Hover-based tooltip (independent of selection)
		if ((tooltipType === 'hover' || tooltipType === 'click') && featureInfo) {
			const { feature, x, y } = featureInfo;
			const tooltipProperties = getTooltipAttributes(tooltipAttributes, feature?.properties);

			const xPos = x + tooltipOffsetX;
			const yPos = y + tooltipOffsetY;

			if (CustomTooltip && typeof CustomTooltip === 'function') {
				tooltip = React.createElement(CustomTooltip, {
					x: xPos,
					y: yPos,
					tooltipProperties,
				});
			} else {
				tooltip = <MapTooltip x={xPos} y={yPos} tooltipProperties={tooltipProperties} />;
			}
		}

		// Click/selection-based tooltip: tied to selection
		if (
			tooltipType === 'selection' &&
			Array.isArray(features) &&
			selection &&
			selection.featureKeys?.length &&
			viewport
		) {
			const selectedId = selection.featureKeys[0];
			const selectedFeature = features.find((f: any) => f.id === selectedId);
			let coordinates;
			// For Polygon geometries, calculate center for tooltip placement
			if (selectedFeature?.geometry?.type === 'Polygon' || selectedFeature?.geometry?.type === 'MultiPolygon') {
				coordinates = getPolygonCenter(selectedFeature);
			} else {
				coordinates = selectedFeature?.geometry?.coordinates;
			}
			console.log(coordinates);
			if (selectedFeature && Array.isArray(coordinates) && coordinates.length === 2) {
				const [px, py] = viewport.project(coordinates);
				const xPos = px + tooltipOffsetX;
				const yPos = py + tooltipOffsetY;
				const tooltipProperties = getTooltipAttributes(tooltipAttributes, selectedFeature?.properties);

				if (CustomTooltip && typeof CustomTooltip === 'function') {
					tooltip = React.createElement(CustomTooltip, {
						x: xPos,
						y: yPos,
						tooltipProperties,
					});
				} else {
					tooltip = <MapTooltip x={xPos} y={yPos} tooltipProperties={tooltipProperties} />;
				}
			}
		}
	}

	console.log(featureInfo, tooltip, CustomTooltip, typeof CustomTooltip, featureInfo, tooltipType, features);

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
			onHover: (info) => {
				if (tooltipType !== 'hover') return;
				if (info.object && info.x != null && info.y != null) {
					setFeatureInfo({ feature: info.object, x: info.x, y: info.y });
				} else {
					setFeatureInfo(null);
				}
			},
			onClick: (info) => {
				if (tooltipType !== 'click') return;
				if (!featureInfo || featureInfo.feature !== info.object) {
					setFeatureInfo({ feature: info.object, x: info.x, y: info.y });
				} else {
					setFeatureInfo(null);
				}
			},
			onDrag: () => {
				// Clear tooltip on drag to avoid mispositioning
				setFeatureInfo(null);
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
