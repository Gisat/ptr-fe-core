import React, { useEffect, useMemo } from 'react';
import { IconLayer } from '@deck.gl/layers';
import { SELECTION_DEFAULT_COLOUR } from '../../../shared/constants/colors';
import { getFeatureId } from '../../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../../shared/helpers/hexToRgbArray';
import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { getSelectionByKey } from '../../../shared/appState/selectors/getSelectionByKey';
import { useAxios } from '../../../shared/hooks/useAxios';
import { LayerSourceProps } from './LayerManager';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { Feature } from '../../../shared/models/models.feature';
import { MapTooltip } from '../../MapSet/MapTooltip/MapTooltip';
import { getTooltipAttributes } from '../../../shared/helpers/getTooltipAttributes';

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
 * @returns {null} This component does not render any DOM elements.
 *
 */
export const IconLayerSource = React.memo(({ layer, onLayerUpdate, viewport, CustomTooltip }: LayerSourceProps) => {
	const [sharedState] = useSharedState();
	const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null);
	const { isActive, key, opacity, datasource, isInteractive, selectionKey, fetchOptions } = layer;
	const { url, documentId, validIntervalIso, configuration } = datasource;
	const route = fetchOptions?.route;
	const method = fetchOptions?.method;

	// We need a fallback URL if no route is provided (e.g. external static GeoJSON file)
	if (!url && !route) {
		throw new Error(`IconLayerSource: Missing both route and url in datasource: ${key}`);
	}

	// Log a warning if the documentId is missing
	if (!documentId) {
		console.warn(`IconLayerSource: Missing documentId in datasource: ${key}`);
	}

	// Parse the datasource configuration
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
	function getColor(feature: Feature): number[] {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			const colourIndex = featureKeyColourIndexPairs[featureId];
			const hex = distinctColours[colourIndex] ?? distinctColours[0];
			return [...hexToRgbArray(hex), 255];
		}
		// If getColor is a function, call it with the feature
		if (typeof layerStyle.getColor === 'function') {
			return layerStyle.getColor(feature);
		}
		return layerStyle.getColor;
	}

	let tooltip = null;
	if (selection && selection.featureKeys?.length && Array.isArray(data) && viewport) {
		const selectedId = selection.featureKeys[0];
		const selectedFeature = data.find((f: any) => f.id === selectedId);
		const coordinates = selectedFeature?.coordinates;
		const tooltipSettings = geojsonOptions?.tooltipSettings;
		const tooltipOffsetX = tooltipSettings?.offsetX || 0;
		const tooltipOffsetY = tooltipSettings?.offsetY || 0;
		const tooltipAttributes = tooltipSettings?.attributes || [];
		const tooltipProperties = getTooltipAttributes(tooltipAttributes, selectedFeature);
		console.log(tooltipProperties, tooltipSettings, selectedFeature);
		if (selectedFeature && Array.isArray(coordinates) && coordinates.length === 2) {
			const [x, y] = viewport.project(coordinates);
			if (CustomTooltip) {
				tooltip = React.createElement(CustomTooltip, {
					x: x + tooltipOffsetX,
					y: y + tooltipOffsetY,
					tooltipProperties: tooltipProperties,
				});
			} else {
				tooltip = <MapTooltip x={x + tooltipOffsetX} y={y + tooltipOffsetY} tooltipProperties={tooltipProperties} />;
			}
		}
	}

	console.log(tooltip, tooltipPosition);

	/**
	 * Memoizes the creation of the IconLayer instance to avoid unnecessary re-renders.
	 * The layer instance is recreated only when its dependencies change.
	 *
	 * @returns {IconLayer|null} The DeckGL IconLayer instance or null if loading.
	 */
	const layerInstance: IconLayer | null = useMemo(() => {
		if (isDataLoading || !data || !iconAtlas || !iconMapping) {
			return null;
		}
		return new IconLayer({
			id: key,

			onHover: (info) => {
				setTooltipPosition(info.x != null && info.y != null ? { x: info.x, y: info.y } : null);
			},

			opacity: opacity ?? 1,
			visible: isActive,
			data,
			updateTriggers: {
				getColor: [layerStyle, selection],
				pickable: [layerStyle, isInteractive],
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
		geojsonOptions,
		isLoading,
		error,
		iconAtlas,
		iconMapping,
		isDataLoading,
	]);

	useEffect(() => {
		onLayerUpdate(key, layerInstance);
		return () => onLayerUpdate(key, null);
	}, [layerInstance, key, onLayerUpdate]);

	// --- Render the tooltip directly ---
	return tooltip;
});
