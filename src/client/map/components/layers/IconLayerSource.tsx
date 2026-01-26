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
 * based on array data, with support for selection coloring and interactivity.
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
	const [featureInfo, setFeatureInfo] = useState<{ feature: any; x: number; y: number } | null>(null);

	// Basic datasource checks
	if (!url && !route) {
		throw new Error(`IconLayerSource: Missing both route and url in datasource: ${key}`);
	}

	if (!documentId) {
		console.warn(`IconLayerSource: Missing documentId in datasource: ${key}`);
	}

	// Parse datasource configuration
	const config = parseDatasourceConfiguration(configuration);
	const geojsonOptions = config?.geojsonOptions;
	if (!geojsonOptions) {
		console.warn(`IconLayerSource: Missing geojsonOptions in datasource configuration: ${key}`);
	}

	// Icon atlas / mapping from style (sprite mode)
	const iconAtlas = geojsonOptions?.layerStyle?.iconAtlas;
	const iconMapping = geojsonOptions?.layerStyle?.iconMapping;

	// Layer style with defaults
	const layerStyle = geojsonOptions?.layerStyle ?? defaultLayerStyle;

	// Selection
	const selection = selectionKey ? getSelectionByKey(sharedState, selectionKey) : null;
	const selectedFeatureKeys = selection?.featureKeys ?? [];
	const distinctColours = selection?.distinctColours ?? [SELECTION_DEFAULT_COLOUR];
	const featureKeyColourIndexPairs = selection?.featureKeyColourIndexPairs ?? {};

	// Tooltip settings
	const tooltipSettings = geojsonOptions?.tooltipSettings;
	const tooltipType = tooltipSettings?.type || 'native'; // 'native' | 'hover' | 'click' | 'selection'

	// Fetch data (memoization of args recommended if useAxios depends on object identity)
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

	// Show "loading" only when fetching from route and not failed yet
	const isDataLoading = !!route && isLoading && !error;

	/**
	 * Returns the color for a feature. If selected, returns selection color, otherwise layer default.
	 */
	function getColor(feature: Feature): number[] {
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
	let tooltip: React.ReactNode = null;

	if (tooltipSettings && tooltipType !== 'native') {
		const tooltipOffsetX = tooltipSettings?.offsetX || 0;
		const tooltipOffsetY = tooltipSettings?.offsetY || -10;
		const tooltipAttributes = tooltipSettings.attributes || [];

		// Hover-based tooltip (independent of selection)
		if ((tooltipType === 'hover' || tooltipType === 'click') && featureInfo) {
			const { feature, x, y } = featureInfo;
			const tooltipProperties = getTooltipAttributes(tooltipAttributes, feature);
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
		if (tooltipType === 'selection' && Array.isArray(data) && selection && selection.featureKeys?.length && viewport) {
			const selectedId = selection.featureKeys[0];
			const selectedFeature = data.find((f: any) => f.id === selectedId);
			const coordinates = selectedFeature?.coordinates;
			if (selectedFeature && Array.isArray(coordinates) && coordinates.length === 2) {
				const [px, py] = viewport.project(coordinates);
				const xPos = px + tooltipOffsetX;
				const yPos = py + tooltipOffsetY;
				const tooltipProperties = getTooltipAttributes(tooltipAttributes, selectedFeature);

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

	console.log(featureInfo, tooltip, CustomTooltip, typeof CustomTooltip, featureInfo);

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
			},
			// Only track hover when tooltipType === 'hover'
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
		tooltipType,
	]);

	useEffect(() => {
		onLayerUpdate(key, layerInstance);
		return () => onLayerUpdate(key, null);
	}, [layerInstance, key, onLayerUpdate]);

	// Render tooltip for this layer (if any); layer itself is managed via onLayerUpdate
	return tooltip;
});
