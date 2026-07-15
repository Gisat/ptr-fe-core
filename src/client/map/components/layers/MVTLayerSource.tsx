import React, { useEffect, useMemo, useState } from 'react';
import { MVTLayer } from '@deck.gl/geo-layers';
import type { MVTLayerProps } from '@deck.gl/geo-layers';
import { SELECTION_DEFAULT_COLOUR } from '../../../shared/constants/colors';
import { getFeatureId } from '../../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../../shared/helpers/hexToRgbArray';
import { getSelectionByKey } from '../../../shared/appState/selectors/getSelectionByKey';
import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { MapFeature } from '../../../shared/models/models.mapFeature';
import { TooltipType } from '../../../shared/models/models.tooltip';
import { getLayerTooltip, LayerTooltipParams } from '../../MapSet/MapTooltip/getLayerTooltip';
import { resolveTooltipType } from '../../MapSet/MapTooltip/resolveTooltipType';
import { LayerSourceProps } from './LayerManager';

type DeckMVTData = MVTLayerProps['data'];
type LayerStyle = Record<string, any>;

/**
 * Vector styling and interaction options reused from geojsonOptions.
 * MVT renders picked features as GeoJSON-like objects, so it can share the
 * same layerStyle, feature id, and tooltip configuration shape.
 */
interface VectorDatasourceOptions {
	layerStyle?: LayerStyle;
	featureIdProperty?: string;
	tooltipSettings?: LayerTooltipParams['tooltipSettings'];
	disableTooltip?: boolean;
}

interface ParsedMVTConfiguration {
	geojsonOptions?: VectorDatasourceOptions;
}

/**
 * Default layer style for MVTLayer rendering.
 */
const defaultLayerStyle: LayerStyle = {
	filled: true,
	stroked: true,
	pickable: false,
	minZoom: 0,
	maxZoom: 16,
	getLineColor: [0, 0, 200, 255],
	getFillColor: [0, 0, 255, 255],
	getLineWidth: 1,
	lineWidthUnits: 'pixels',
	pointRadiusScale: 10,
	pointRadiusMinPixels: 2,
	pointRadiusMaxPixels: 5,
};

/**
 * Appends datasource metadata as query parameters to an MVT tile URL template.
 *
 * @param {string} template - Tile URL template, e.g. `/tiles/{z}/{x}/{y}`.
 * @param {Record<string, string | undefined>} params - Optional query params to append.
 * @returns {string} Tile URL template with encoded query parameters.
 */
function appendQueryParams(template: string, params: Record<string, string | undefined>): string {
	const entries = Object.entries(params).filter((entry): entry is [string, string] => !!entry[1]);
	if (!entries.length) return template;

	const [path, hash = ''] = template.split('#');
	const separator = path.includes('?') ? '&' : '?';
	const query = entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');

	return `${path}${separator}${query}${hash ? `#${hash}` : ''}`;
}

/**
 * A React component that creates and manages an MVT layer.
 *
 * MVT data is tile-based, so unlike GeoJSON we do not have one complete feature
 * collection in memory. Hover/click tooltips use the picked tile feature.
 *
 * @param {LayerSourceProps} props - The props for the MVTLayerSource component.
 * @returns {React.ReactNode} Tooltip element for this layer (if any), no DOM for the layer itself.
 */
export const MVTLayerSource = React.memo(({ layer, onLayerUpdate, CustomTooltip }: LayerSourceProps) => {
	const [sharedState] = useSharedState();
	const { isActive, key, opacity, datasource, isInteractive, selectionKey, fetchOptions } = layer;
	const { url, documentId, validIntervalIso, configuration } = datasource;
	const route = fetchOptions?.route;

	const [featureInfo, setFeatureInfo] = useState<{ feature: MapFeature; x: number; y: number } | null>(null);

	if (!url && !route) {
		throw new Error(`MVTLayerSource: Missing both route and url in datasource: ${key}`);
	}

	if (!documentId) {
		console.warn(`MVTLayerSource: Missing documentId in datasource: ${key}`);
	}

	const config = useMemo(
		() => parseDatasourceConfiguration(configuration) as ParsedMVTConfiguration | undefined,
		[configuration]
	);
	const geojsonOptions = useMemo(
		() =>
			config?.geojsonOptions
				? {
						...config?.geojsonOptions,
					}
				: undefined,
		[config]
	);
	if (!geojsonOptions) {
		console.warn(`MVTLayerSource: Missing geojsonOptions in datasource configuration: ${key}`);
	}

	const layerStyle = geojsonOptions?.layerStyle ?? defaultLayerStyle;

	const selection = selectionKey ? getSelectionByKey(sharedState, selectionKey) : null;
	const selectedFeatureKeys = selection?.featureKeys ?? [];
	const distinctColours = selection?.distinctColours ?? [SELECTION_DEFAULT_COLOUR];
	const featureKeyColourIndexPairs = selection?.featureKeyColourIndexPairs ?? {};

	const tooltipSettings = geojsonOptions?.tooltipSettings;
	const hasCustomTooltipComponent = !!CustomTooltip;
	const tooltipType: TooltipType = resolveTooltipType(tooltipSettings?.type, hasCustomTooltipComponent);
	const tooltipEnabled = !geojsonOptions?.disableTooltip;

	/**
	 * MVTLayer expects a tile URL template and fetches individual tiles itself.
	 * If a component route is provided, datasource metadata is passed through
	 * as query parameters for the proxy route.
	 */
	const data = useMemo<DeckMVTData | undefined>(() => {
		if (route) {
			return appendQueryParams(route, {
				documentId,
				validIntervalIso,
			});
		}

		return url;
	}, [route, documentId, validIntervalIso, url]);

	/**
	 * Returns the line color for a feature.
	 * If the feature is selected, returns its assigned selection color; otherwise,
	 * returns the configured layer style color.
	 *
	 * @param {MapFeature} feature - Picked MVT feature represented as a GeoJSON-like object.
	 * @returns {number[]} The RGBA color array for the feature line.
	 */
	function getLineColor(feature: MapFeature): number[] {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			const colourIndex = featureKeyColourIndexPairs[featureId];
			const hex = distinctColours[colourIndex] ?? distinctColours[0];
			return [...hexToRgbArray(hex), 255];
		}
		return layerStyle.getLineColor;
	}

	/**
	 * Returns the line width for a feature.
	 * If the feature is selected, returns a thicker line; otherwise, returns the
	 * configured layer style width.
	 *
	 * @param {MapFeature} feature - Picked MVT feature represented as a GeoJSON-like object.
	 * @returns {number} The width of the feature line.
	 */
	function getLineWidth(feature: MapFeature): number {
		const featureId = getFeatureId(feature, geojsonOptions?.featureIdProperty);
		if (featureId && selectedFeatureKeys.includes(featureId)) {
			return 5;
		}
		return layerStyle.getLineWidth;
	}

	/**
	 * Compute tooltip React node from picked MVT feature info.
	 * Unlike GeoJSON, MVT does not have a complete feature array available here,
	 * so this only supports screen-space hover/click tooltip modes.
	 */
	const tooltip =
		tooltipEnabled &&
		tooltipSettings &&
		getLayerTooltip({
			tooltipSettings,
			featureInfo,
			CustomTooltip,
		});

	/**
	 * Memoize the creation of the MVTLayer instance to avoid unnecessary re-renders.
	 * The layer instance is recreated only when its rendering inputs change.
	 */
	const layerInstance: MVTLayer | null = useMemo(() => {
		if (!data) {
			return null;
		}

		return new MVTLayer({
			id: key,
			opacity: opacity ?? 1,
			visible: isActive,
			data: data as DeckMVTData,
			updateTriggers: {
				getLineColor: [layerStyle, selection],
				getFillColor: [layerStyle, selection],
				getLineWidth: [layerStyle, selection],
				pickable: [layerStyle, isInteractive],
				onHover: [CustomTooltip],
			},
			/**
			 * Hover handler:
			 * - updates `featureInfo` only when hover tooltips are enabled and active
			 * - clears tooltip state when no feature is hovered
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
					console.warn('MVTLayerSource: onClick handler - clickedFeature is null.');
					return;
				}

				const currentId = featureInfo ? getFeatureId(featureInfo.feature, geojsonOptions?.featureIdProperty) : null;
				const clickedId = getFeatureId(clickedFeature, geojsonOptions?.featureIdProperty);

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
			uniqueIdProperty: geojsonOptions?.featureIdProperty,
			getLineColor,
			getLineWidth,
			pickable: isInteractive ?? layerStyle.pickable,
		} as any);
	}, [
		isActive,
		key,
		opacity,
		isInteractive,
		layerStyle,
		selection,
		data,
		geojsonOptions,
		tooltipEnabled,
		tooltipType,
		CustomTooltip,
	]);

	/**
	 * Effect hook to handle layer updates.
	 * The `onLayerUpdate` callback is called with the layer instance when the component mounts
	 * and with `null` when the component unmounts.
	 */
	useEffect(() => {
		onLayerUpdate(key, layerInstance);
		return () => onLayerUpdate(key, null);
	}, [layerInstance, key, onLayerUpdate]);

	return isActive ? tooltip : null;
});
