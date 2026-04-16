import React, { useEffect, useMemo, useState } from 'react';
import { IconLayer } from '@deck.gl/layers';
import { SELECTION_DEFAULT_COLOUR } from '../../../shared/constants/colors';
import { getFeatureId } from '../../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../../shared/helpers/hexToRgbArray';
import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getSelectionByKey } from '../../../shared/appState/selectors/getSelectionByKey';
import { useAxios } from '../../../shared/hooks/useAxios';
import { LayerSourceProps } from './LayerManager';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { MapFeature } from '../../../shared/models/models.mapFeature';
import { getLayerTooltip } from '../../MapSet/MapTooltip/getLayerTooltip';
import { resolveTooltipType } from '../../MapSet/MapTooltip/resolveTooltipType';
import { TooltipType } from '../../../shared/models/models.tooltip';

/**
 * Default layer style for IconLayer rendering.
 * @type {Object}
 */
const defaultLayerStyle = {
	filled: true,
	pickable: false,
	getColor: [0, 0, 0, 100],
	getSize: 40,
	getIcon: 'marker',
	getPosition: (d: { coordinates: [number, number] }) => d.coordinates,
};

/**
 * IconLayerSource is a React component that creates and manages a DeckGL IconLayer.
 * This component uses the `IconLayer` from `@deck.gl/layers` to render icon markers
 * based on GeoJSON or array data, with support for selection coloring and interactivity.
 * It also integrates tooltip functionality for hover, click, and selection-based tooltips.
 *
 * **Note:** The `layerStyle` object must include both `iconAtlas` (the icon sprite image)
 * and `iconMapping` (an object mapping icon names to their positions/sizes in the atlas).
 * If either is missing, the IconLayer will not render.
 *
 * **Note:** Added default `getPosition` accessor to ensure proper icon placement and getSize
 * for icon sizing. Otherwise there might be issues with icons not appearing.
 * These can be overridden by providing them in the `layerStyle`.
 *
 * @param {LayerSourceProps} props - The props for the IconLayerSource component.
 * @param {RenderingLayer} props.layer - The layer configuration object.
 * @param {(id: string, instance: IconLayer | null) => void} props.onLayerUpdate - Callback to handle updates to the layer instance.
 * @returns {React.ReactNode} Tooltip element for this layer (if any), no DOM for the layer itself.
 */
export const IconLayerSource = React.memo(({ layer, onLayerUpdate, viewport, CustomTooltip }: LayerSourceProps) => {
	const [sharedState] = useSharedState();

	const { isActive, key, opacity, datasource, isInteractive, selectionKey, fetchOptions } = layer;
	const { url, documentId, validIntervalIso, configuration } = datasource;
	const route = fetchOptions?.route;
	const method = fetchOptions?.method;

	// Hover info for hover-based tooltip
	const [featureInfo, setFeatureInfo] = useState<{
		feature: MapFeature;
		x: number;
		y: number;
	} | null>(null);

	// We need a fallback URL if no route is provided (e.g. external static GeoJSON file)
	if (!url && !route) {
		throw new Error(`IconLayerSource: Missing both route and url in datasource: ${key}`);
	}

	// Log a warning if the documentId is missing
	if (!documentId) {
		console.warn(`IconLayerSource: Missing documentId in datasource: ${key}`);
	}

	// Parse datasource configuration
	const config = parseDatasourceConfiguration(configuration);
	// Extract GeoJSON options from the parsed configuration
	// TODO geojsonOptions are currently used for styling and featureIdProperty, solve this properly in the future
	const geojsonOptions = config?.geojsonOptions;
	if (!geojsonOptions) {
		console.warn(`IconLayerSource: Missing geojsonOptions in datasource configuration: ${key}`);
	}

	// Extract iconAtlas and iconMapping from layerStyle
	const iconAtlas = geojsonOptions?.layerStyle?.iconAtlas;
	const iconMapping = geojsonOptions?.layerStyle?.iconMapping;

	// Layer style with defaults
	const layerStyle = geojsonOptions?.layerStyle ?? defaultLayerStyle;

	// Selection
	const selection = selectionKey ? getSelectionByKey(sharedState, selectionKey) : null;
	const selectedFeatureKeys = selection?.featureKeys ?? [];
	const distinctColours = selection?.distinctColours ?? [SELECTION_DEFAULT_COLOUR];
	const featureKeyColourIndexPairs = selection?.featureKeyColourIndexPairs ?? {};

	// Tooltip settings from geojsonOptions (styling & behavior)
	const tooltipSettings = geojsonOptions?.tooltipSettings;
	const hasCustomTooltipComponent = !!CustomTooltip;
	// Resolve tooltip type
	const tooltipType: TooltipType = resolveTooltipType(tooltipSettings?.type, hasCustomTooltipComponent);
	const tooltipEnabled = !geojsonOptions?.disableTooltip && isInteractive;

	// Load the data from route
	const {
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

	// Normalize to MapFeature[] for selection & tooltips
	const features: MapFeature[] = Array.isArray(data) ? (data as MapFeature[]) : [];

	// Show "loading" only when fetching from route and not failed yet
	const isDataLoading = !!route && isLoading && !error;

	/**
	 * Returns the color for a feature. If selected, returns selection color, otherwise layer default.
	 */
	function getColor(feature: MapFeature): number[] {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			const colourIndex = featureKeyColourIndexPairs[featureId];
			const hex = distinctColours[colourIndex] ?? distinctColours[0];
			return [...hexToRgbArray(hex), 255];
		}
		if (typeof layerStyle.getColor === 'function') {
			return layerStyle.getColor(feature);
		}
		return layerStyle.getColor;
	}

	// ---------- Tooltip creation ----------
	/**
	 * Compute tooltip React node based on:
	 * - hover/click featureInfo (screen-space tooltip)
	 * - or selection + viewport + feature.coordinates (map-space tooltip)
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
			// For IconLayer, position comes from the helper `coordinates` field.
			getCoordinates: (feature: MapFeature) => feature?.coordinates,
		});

	/**
	 * Memoizes the creation of the IconLayer instance to avoid unnecessary re-creation.
	 */
	const layerInstance: IconLayer | null = useMemo(() => {
		if (isDataLoading || !data || !iconAtlas || !iconMapping) {
			return null;
		}

		return new IconLayer({
			id: key,
			opacity: opacity ?? 1,
			visible: isActive,
			data,
			iconAtlas,
			iconMapping,
			updateTriggers: {
				getColor: [layerStyle, selection],
				pickable: [layerStyle, isInteractive],
				onHover: [CustomTooltip],
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
					console.warn('IconLayerSource: onClick handler - clickedFeature is null.');
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
			getSize: 40,
			getPosition: (d: { coordinates: [number, number] }) => d?.coordinates,
			...layerStyle,
			getColor,
			pickable: isInteractive ?? layerStyle.pickable,
		});
	}, [
		isActive,
		key,
		opacity,
		isInteractive,
		layerStyle,
		selection,
		data,
		iconAtlas,
		iconMapping,
		isDataLoading,
		geojsonOptions,
		CustomTooltip,
	]);

	/**
	 * Effect hook to handle layer updates.
	 * The `onLayerUpdate` callback is called with the layer instance when the component mounts
	 * and with `null` when the component unmounts.
	 */
	useEffect(() => {
		onLayerUpdate(key, layerInstance);
		return () => onLayerUpdate(key, null); // cleanup on unmount
	}, [layerInstance, key, onLayerUpdate]);

	// Render tooltip for this layer (if any); layer itself is managed via onLayerUpdate
	return isActive ? tooltip : null;
});
