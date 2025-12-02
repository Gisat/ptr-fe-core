import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../shared/models/parsers.datasources';

/**
 * Tooltip attribute definition.
 * @property {string} key - Unique key for the attribute.
 * @property {string} [label] - Optional label for display.
 * @property {string|number} [value] - Value to display.
 * @property {string} [unit] - Optional unit for the value.
 * @property {number} [decimalPlaces] - Optional decimal places for number formatting.
 */
export interface TooltipAttribute {
	key: string;
	label?: string;
	value?: string | number;
	unit?: string;
	decimalPlaces?: number;
}

/**
 * Tooltip state object.
 * @property {number} x - X position for tooltip (screen coordinates).
 * @property {number} y - Y position for tooltip (screen coordinates).
 * @property {TooltipAttribute[]} tooltipProperties - Array of tooltip attributes to display.
 */
interface TooltipState {
	x: number;
	y: number;
	tooltipProperties: TooltipAttribute[];
}

/**
 * Parameters for handleMapHover function.
 * @property {PickingInfo} event - DeckGL picking event.
 * @property {RenderingLayer[] | undefined} mapLayers - Array of map layers.
 * @property {(tooltip: TooltipState | null) => void} setTooltip - Function to set tooltip state.
 * @property {(isHovered: boolean) => void} setLayerIsHovered - Function to set hover state.
 * @property {boolean} useCustomTooltip - Whether to use custom tooltip logic.
 */
interface HandleMapHoverParams {
	event: PickingInfo;
	mapLayers: RenderingLayer[] | undefined;
	setTooltip: (tooltip: TooltipState | null) => void;
	setLayerIsHovered: (isHovered: boolean) => void;
	useCustomTooltip: boolean;
}

/**
 * Handles hover events on the map and sets tooltip if enabled.
 *
 * - Shows tooltip with feature properties if enabled in layer configuration.
 * - Tooltip attributes and formatting are defined in geojsonOptions.tooltipSettings.
 * - If no attributes are defined, uses 'value' property if present.
 * - Tooltip is hidden if not enabled or no valid properties found.
 * - Also updates layer hover state for cursor feedback.
 * - Optimized: skips expensive calculations if hovered feature did not change.
 *
 * @param {HandleMapHoverParams} params - Parameters for hover handling.
 * @returns {void}
 */
export function handleMapHover({
	event,
	mapLayers,
	setTooltip,
	setLayerIsHovered,
	useCustomTooltip,
}: HandleMapHoverParams): void {
	// Early exit: no feature hovered or missing coordinates
	if (!event.object || event.x == null || event.y == null) {
		setTooltip(null);
		setLayerIsHovered(false);
		return;
	}

	// Get layer configuration for hovered feature
	const layerId = event?.layer?.id;
	const mapLayer = Array.isArray(mapLayers)
		? mapLayers.find((layer: RenderingLayer) => layer.key === layerId)
		: undefined;

	const featureProperties = event.object?.properties;

	const config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

	// Update hover state for cursor feedback
	const selectionsEnabled = !config?.geojsonOptions?.disableSelections;
	setLayerIsHovered(selectionsEnabled && !!layerId);

	// If using DeckGL's native tooltip, skip custom tooltip logic
	if (!useCustomTooltip) return;

	// Check if tooltip is enabled in config
	const tooltipEnabled = !config?.geojsonOptions?.disableTooltip;
	if (!tooltipEnabled) {
		return;
	}

	const tooltipSettings = config?.geojsonOptions?.tooltipSettings;
	let tooltipProperties: TooltipAttribute[] | undefined;

	/**
	 * If tooltip attributes are defined in settings, use them.
	 * Otherwise, tooltip will not be shown.
	 */
	if (tooltipSettings?.attributes && Array.isArray(tooltipSettings.attributes)) {
		tooltipProperties = tooltipSettings.attributes
			.map((attribute: TooltipAttribute) => {
				let value = featureProperties[attribute.key];
				// Round value if decimalPlaces is specified
				if (typeof value === 'number' && typeof attribute.decimalPlaces === 'number') {
					value = Number(value.toFixed(attribute.decimalPlaces));
				}
				return {
					key: attribute.key,
					label: attribute.label ?? attribute.key,
					value,
					unit: attribute.unit ?? '',
				};
			})
			.filter((attr) => attr.value !== undefined && attr.value !== null);
	}

	/**
	 * If no valid tooltip properties, do not show tooltip.
	 */
	if (!tooltipProperties || tooltipProperties.length === 0) {
		setTooltip(null);
		return;
	}

	/**
	 * Update both position and content of the tooltip.
	 */
	setTooltip({
		x: event.x,
		y: event.y,
		tooltipProperties,
	});
}
