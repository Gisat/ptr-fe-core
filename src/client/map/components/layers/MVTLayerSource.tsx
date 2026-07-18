import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MVTLayer } from '@deck.gl/geo-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import { CompositeLayer, Layer } from '@deck.gl/core';
import { SELECTION_DEFAULT_COLOUR } from '../../../shared/constants/colors';
import { getFeatureId } from '../../../shared/helpers/getFeatureId';
import { hexToRgbArray } from '../../../shared/helpers/hexToRgbArray';
import { getSelectionByKey } from '../../../shared/appState/selectors/getSelectionByKey';
import { useSharedState } from '../../../shared/hooks/state.useSharedState';
import { useAxios } from '../../../shared/hooks/useAxios';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { MapFeature } from '../../../shared/models/models.mapFeature';
import { TooltipType } from '../../../shared/models/models.tooltip';
import { getLayerTooltip } from '../../MapSet/MapTooltip/getLayerTooltip';
import { resolveTooltipType } from '../../MapSet/MapTooltip/resolveTooltipType';
import { LayerInstance, LayerSourceProps } from './LayerManager';

type DeckMVTData = string | string[];
type FeatureInfo = { feature: MapFeature; x: number; y: number } | null;
type DeckColor = [number, number, number, number];

/** Minimal GeoJSON collection shape used by the selected-feature overlay layer. */
type GeojsonFeatureCollection = { type: 'FeatureCollection'; features: MapFeature[] };

/**
 * Supported response shapes from the selected-features endpoint.
 *
 * The endpoint may return one feature, an array of features, or a FeatureCollection.
 * The component normalizes all variants into a feature array before caching them by id.
 */
type SelectionGeometryData = GeojsonFeatureCollection | MapFeature | MapFeature[];

/**
 * Small composite wrapper used to keep the MVT layer and optional selection overlay
 * registered as one logical layer in LayerManager.
 */
class MVTSelectionCompositeLayer extends CompositeLayer<{ layers: Layer[] }> {
	renderLayers() {
		return this.props.layers;
	}
}

/**
 * Default layer style for MVTLayer rendering.
 */
const defaultLayerStyle = {
	filled: true,
	stroked: true,
	pickable: false,
	minZoom: 0,
	maxZoom: 16,
	getLineColor: [0, 0, 200, 255],
	getFillColor: [0, 0, 255, 255],
	getLineWidth: 1,
	lineWidthUnits: 'pixels' as const,
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
 * Normalizes selected-feature geometry returned by the backend.
 *
 * @param {SelectionGeometryData | null} data - Raw endpoint response.
 * @returns {MapFeature[]} Flat feature array suitable for caching and GeoJsonLayer rendering.
 */
function normalizeFeatures(data: SelectionGeometryData | null): MapFeature[] {
	if (!data) return [];
	if (Array.isArray(data)) return data;
	if (data.type === 'FeatureCollection') return data.features;
	if (data.type === 'Feature') return [data];
	return [];
}

/**
 * Derives the selected-features endpoint from an MVT tile route template.
 *
 * Convention:
 * - tiles are requested from `<base>/{z}/{x}/{y}`
 * - selected feature geometries are requested from `<base>/selected-features`
 *
 * If the route cannot be derived, the component does not fetch overlay geometry.
 * Selected features then fall back to the default in-tile MVT color and line-width styling.
 *
 * @param {string | undefined} template - MVT tile route template.
 * @returns {string | undefined} Selected-features endpoint or undefined when no `{z}` segment exists.
 */
function getSelectedFeaturesRouteFromMVTTemplate(template?: string): string | undefined {
	if (!template) return undefined;

	const [path] = template.split(/[?#]/);
	const zoomTemplateIndex = path.indexOf('/{z}');

	// If the template does not contain '/{z}', return undefined as we cannot derive the selected features route.
	if (zoomTemplateIndex === -1) return undefined;

	// Return the selected features path expected immediately before the tile zoom segment.
	return `${path.slice(0, zoomTemplateIndex)}/selected-features`;
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

	const [featureInfo, setFeatureInfo] = useState<FeatureInfo>(null);
	const featureInfoRef = useRef<FeatureInfo>(null);
	const [selectionGeometryFeaturesByKey, setSelectionGeometryFeaturesByKey] = useState<Record<string, MapFeature>>({});

	/**
	 * Sync featureInfo state with featureInfoRef to enable same-click dismiss logic.
	 */
	useEffect(() => {
		featureInfoRef.current = featureInfo;
	}, [featureInfo]);

	if (!url && !route) {
		throw new Error(`MVTLayerSource: Missing both route and url in datasource: ${key}`);
	}

	if (!documentId) {
		console.warn(`MVTLayerSource: Missing documentId in datasource: ${key}`);
	}

	const configurationKey = typeof configuration === 'string' ? configuration : JSON.stringify(configuration);
	const config = useMemo(() => parseDatasourceConfiguration(configuration), [configurationKey]);
	const geojsonOptions = config?.geojsonOptions;
	if (!geojsonOptions) {
		console.warn(`MVTLayerSource: Missing geojsonOptions in datasource configuration: ${key}`);
	}

	const layerStyle = geojsonOptions?.layerStyle ?? defaultLayerStyle;

	const selection = selectionKey ? getSelectionByKey(sharedState, selectionKey) : null;
	const selectedFeatureKeys = selection?.featureKeys ?? [];
	const distinctColours = selection?.distinctColours ?? [SELECTION_DEFAULT_COLOUR];
	const featureKeyColourIndexPairs = selection?.featureKeyColourIndexPairs ?? {};
	const selectedFeatureKeysKey = selectedFeatureKeys.join('|');
	const selectedFeatureKeySet = useMemo(
		() => new Set(selectedFeatureKeys.map((featureKey) => String(featureKey))),
		[selectedFeatureKeysKey]
	);
	const distinctColoursKey = distinctColours.join('|');
	const featureKeyColourIndexPairsKey = JSON.stringify(featureKeyColourIndexPairs);

	const tooltipSettings = geojsonOptions?.tooltipSettings;
	const hasCustomTooltipComponent = !!CustomTooltip;
	const tooltipType: TooltipType = resolveTooltipType(tooltipSettings?.type, hasCustomTooltipComponent);
	const tooltipEnabled = !geojsonOptions?.disableTooltip;
	const selectionsEnabled = !geojsonOptions?.disableSelections;

	/**
	 * MVT tiles simplify geometries per tile, so selected feature borders may appear
	 * fragmented when styled directly inside the MVTLayer. When the route convention
	 * can be derived and fetched, we draw full selected-feature borders in a GeoJsonLayer
	 * overlay. When it cannot be derived, or the derived endpoint fails, the MVTLayer
	 * itself keeps the default selection coloring behavior.
	 */
	const selectedFeaturesRoute = getSelectedFeaturesRouteFromMVTTemplate(route);

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

	const missingSelectionGeometryFeatureKeys = useMemo(() => {
		if (!selectedFeaturesRoute || !selectedFeatureKeys.length) return [];

		// Only fetch selected features that are not already cached locally.
		return selectedFeatureKeys.filter((featureKey) => !selectionGeometryFeaturesByKey[String(featureKey)]);
	}, [selectedFeatureKeysKey, selectionGeometryFeaturesByKey, selectedFeaturesRoute]);
	const missingSelectionGeometryFeatureKeysKey = missingSelectionGeometryFeatureKeys.join('|');

	/**
	 * POST body expected by the selected-features endpoint.
	 *
	 * `features` contains only missing ids, because selected geometries are cached
	 * in `selectionGeometryFeaturesByKey` after each successful response.
	 */
	const selectionGeometryPayload = useMemo(() => {
		return {
			documentId,
			validIntervalIso,
			url,
			features: missingSelectionGeometryFeatureKeys,
			featureIdProperty: geojsonOptions?.featureIdProperty,
		};
	}, [documentId, validIntervalIso, url, missingSelectionGeometryFeatureKeysKey, geojsonOptions?.featureIdProperty]);

	const { data: selectionGeometryData, error: selectionGeometryError } = useAxios<SelectionGeometryData>(
		{ fetchUrl: selectedFeaturesRoute },
		undefined,
		selectionGeometryPayload,
		{
			method: 'POST',
			skip: !selectedFeaturesRoute || !selectionsEnabled || !missingSelectionGeometryFeatureKeys.length,
		}
	);

	/**
	 * Effective overlay route.
	 *
	 * The URL can be derived locally, but only the POST response tells us whether the
	 * endpoint actually exists. A failed request disables the overlay path so selected
	 * features fall back to the original MVTLayer selection styling.
	 */
	const selectionGeometryRoute = selectionGeometryError ? undefined : selectedFeaturesRoute;
	const selectionBorderHandledByOverlay = !!selectionGeometryRoute;

	/**
	 * Reads a feature id without letting malformed tile features break rendering.
	 *
	 * MVT picked objects can vary depending on source data and tile encoding, so all
	 * selection checks go through this safe wrapper.
	 *
	 * @param {MapFeature} feature - MVT or GeoJSON feature.
	 * @returns {string | number | null} Feature id, or null when it cannot be resolved.
	 */
	function getFeatureIdSafely(feature: MapFeature): string | number | null {
		try {
			return getFeatureId(feature, geojsonOptions?.featureIdProperty);
		} catch {
			return null;
		}
	}

	/**
	 * Checks whether a feature belongs to the current layer selection.
	 *
	 * @param {MapFeature} feature - Feature to test.
	 * @returns {boolean} True when the feature id exists in selectedFeatureKeys.
	 */
	function isSelectedFeature(feature: MapFeature): boolean {
		const featureId = getFeatureIdSafely(feature);
		return featureId !== null && selectedFeatureKeySet.has(String(featureId));
	}

	/**
	 * Resolves the color assigned to a selected feature.
	 *
	 * @param {MapFeature} feature - Selected feature.
	 * @param {number} alpha - Alpha channel value from 0 to 255.
	 * @returns {DeckColor} RGBA color array for deck.gl.
	 */
	function getSelectionColor(feature: MapFeature, alpha: number): DeckColor {
		const featureId = getFeatureIdSafely(feature);
		const colourIndex = featureId !== null ? featureKeyColourIndexPairs[String(featureId)] : undefined;
		const fallbackColour = distinctColours[0] ?? SELECTION_DEFAULT_COLOUR;
		const hex = typeof colourIndex === 'number' ? (distinctColours[colourIndex] ?? fallbackColour) : fallbackColour;
		return [...hexToRgbArray(hex), alpha];
	}

	/**
	 * Full selected geometries in selection order.
	 *
	 * If there is no selected-features route, this remains empty and selection styling
	 * stays on the MVTLayer accessors.
	 */
	const selectionGeometryFeatures = useMemo(() => {
		if (!selectionGeometryRoute || !selectedFeatureKeys.length) return [];

		return selectedFeatureKeys
			.map((featureKey) => selectionGeometryFeaturesByKey[String(featureKey)])
			.filter((feature): feature is MapFeature => !!feature);
	}, [selectionGeometryFeaturesByKey, selectionGeometryRoute, selectedFeatureKeysKey]);

	const selectionOverlayFeatures = useMemo(() => {
		return selectionGeometryRoute ? selectionGeometryFeatures : [];
	}, [selectionGeometryFeatures, selectionGeometryRoute]);

	/**
	 * GeoJSON payload for the optional overlay layer.
	 *
	 * The overlay is rendered only when selected feature geometries have been fetched.
	 */
	const selectionGeometryFeatureCollection = useMemo<GeojsonFeatureCollection>(
		() => ({
			type: 'FeatureCollection',
			features: selectionOverlayFeatures,
		}),
		[selectionOverlayFeatures]
	);

	/**
	 * Store fetched full geometries by feature id.
	 *
	 * This allows later selection changes to reuse already-fetched geometries and keeps
	 * subsequent POST requests limited to missing selected ids.
	 */
	useEffect(() => {
		if (!selectionGeometryData) return;

		const features = normalizeFeatures(selectionGeometryData);
		if (!features.length) return;

		setSelectionGeometryFeaturesByKey((previousFeatures) => {
			let hasChanges = false;
			const nextFeatures = { ...previousFeatures };

			for (const feature of features) {
				const featureId = getFeatureIdSafely(feature);
				if (featureId === null) continue;

				const featureKey = String(featureId);
				if (nextFeatures[featureKey] !== feature) {
					nextFeatures[featureKey] = feature;
					hasChanges = true;
				}
			}

			return hasChanges ? nextFeatures : previousFeatures;
		});
	}, [selectionGeometryData, geojsonOptions]);

	useEffect(() => {
		if (selectionGeometryError) {
			console.warn('MVTLayerSource: Failed to load selected feature geometry overlay.', selectionGeometryError);
		}
	}, [selectionGeometryError]);

	/**
	 * Returns the line color for a feature.
	 * If the feature is selected, returns its assigned selection color; otherwise,
	 * returns the configured layer style color.
	 *
	 * @param {MapFeature} feature - Picked MVT feature represented as a GeoJSON-like object.
	 * @returns {number[]} The RGBA color array for the feature line.
	 */
	function getLineColor(feature: MapFeature): number[] {
		if (!selectedFeatureKeys.length) {
			return typeof layerStyle.getLineColor === 'function' ? layerStyle.getLineColor(feature) : layerStyle.getLineColor;
		}

		if (isSelectedFeature(feature)) {
			if (selectionBorderHandledByOverlay) {
				// Border is drawn by the full-geometry overlay, so keep MVT tile styling unchanged.
				return typeof layerStyle.getLineColor === 'function'
					? layerStyle.getLineColor(feature)
					: layerStyle.getLineColor;
			}
			return getSelectionColor(feature, 255);
		}
		return typeof layerStyle.getLineColor === 'function' ? layerStyle.getLineColor(feature) : layerStyle.getLineColor;
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
		if (!selectedFeatureKeys.length) {
			return typeof layerStyle.getLineWidth === 'function' ? layerStyle.getLineWidth(feature) : layerStyle.getLineWidth;
		}

		if (isSelectedFeature(feature)) {
			if (selectionBorderHandledByOverlay) {
				// Avoid double-thick borders when the GeoJSON overlay is active.
				return typeof layerStyle.getLineWidth === 'function'
					? layerStyle.getLineWidth(feature)
					: layerStyle.getLineWidth;
			}
			return 5;
		}
		return typeof layerStyle.getLineWidth === 'function' ? layerStyle.getLineWidth(feature) : layerStyle.getLineWidth;
	}

	/**
	 * Compute tooltip React node from picked MVT feature info.
	 * Unlike GeoJSON, MVT does not have a complete feature array available here,
	 * so this only supports screen-space hover/click tooltip modes.
	 */
	const tooltip =
		tooltipEnabled &&
		tooltipSettings &&
		tooltipType !== TooltipType.Selection &&
		getLayerTooltip({
			tooltipSettings,
			featureInfo,
			CustomTooltip,
		});

	/**
	 * Memoize the creation of the MVTLayer instance to avoid unnecessary re-renders.
	 * The layer instance is recreated only when its rendering inputs change.
	 */
	const layerInstance: LayerInstance = useMemo(() => {
		if (!data) {
			return null;
		}

		const handleHover = (info) => {
			if (!tooltipEnabled || tooltipType !== TooltipType.Hover) return;
			if (info.object && info.x != null && info.y != null) {
				setFeatureInfo({ feature: info.object as MapFeature, x: info.x, y: info.y });
			} else {
				setFeatureInfo(null);
			}
		};

		const handleClick = (info) => {
			const clickedFeature = info.object as MapFeature | null;
			if (!tooltipEnabled || tooltipType !== TooltipType.Click) return;

			if (!clickedFeature || info.x == null || info.y == null) {
				setFeatureInfo(null);
				console.warn('MVTLayerSource: onClick handler - clickedFeature is null.');
				return;
			}

			const currentId = featureInfoRef.current ? getFeatureIdSafely(featureInfoRef.current.feature) : null;
			const clickedId = getFeatureIdSafely(clickedFeature);

			if (currentId && clickedId && currentId === clickedId) {
				setFeatureInfo(null);
			} else {
				setFeatureInfo({ feature: clickedFeature, x: info.x, y: info.y });
			}
		};

		const handleDrag = () => {
			if (tooltipEnabled) {
				setFeatureInfo(null);
			}
		};

		const mvtLayer = new MVTLayer({
			id: `${key}-mvt`,
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
			...layerStyle,
			uniqueIdProperty: geojsonOptions?.featureIdProperty,
			getLineColor,
			getLineWidth,
			pickable: isInteractive ?? layerStyle.pickable,
		});

		const layers: Layer[] = [mvtLayer];

		if (selectionOverlayFeatures.length) {
			/**
			 * Full-geometry border overlay for selected MVT features.
			 *
			 * MVT feature geometry can be clipped and simplified per tile. Rendering fetched
			 * GeoJSON geometry on top gives selected features one continuous border while the
			 * MVTLayer continues to render the base fill/stroke.
			 */
			const selectionOverlayLayer = new GeoJsonLayer({
				id: `${key}-selection-overlay`,
				opacity: opacity ?? 1,
				visible: isActive,
				data: selectionGeometryFeatureCollection,
				filled: true,
				stroked: true,
				pickable: false,
				getFillColor: [0, 0, 0, 0],
				getLineColor: (feature: MapFeature) => getSelectionColor(feature, 255),
				getLineWidth: 5,
				lineWidthUnits: 'pixels',
				updateTriggers: {
					getFillColor: [selectedFeatureKeysKey, distinctColoursKey, featureKeyColourIndexPairsKey],
					getLineColor: [selectedFeatureKeysKey, distinctColoursKey, featureKeyColourIndexPairsKey],
				},
			} as any);

			layers.push(selectionOverlayLayer);
		}

		return new MVTSelectionCompositeLayer({
			id: key,
			onHover: handleHover,
			onClick: handleClick,
			onDrag: handleDrag,
			layers,
		});
	}, [
		isActive,
		key,
		opacity,
		isInteractive,
		layerStyle,
		selectedFeatureKeysKey,
		distinctColoursKey,
		featureKeyColourIndexPairsKey,
		data,
		geojsonOptions,
		tooltipEnabled,
		tooltipType,
		CustomTooltip,
		selectionsEnabled,
		selectionBorderHandledByOverlay,
		selectionGeometryFeatures,
		selectionOverlayFeatures,
		selectionGeometryFeatureCollection,
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
