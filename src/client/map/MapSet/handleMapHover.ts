import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../shared/models/parsers.datasources';
import { getTooltipAttributes } from '../../shared/helpers/getTooltipAttributes';
import { TooltipAttribute } from '../../shared/models/models.tooltip';

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
 *
 * @param {HandleMapHoverParams} params - Parameters for hover handling.
 * @returns {void}
 */
export function handleMapHover({ event, mapLayers, setLayerIsHovered }: HandleMapHoverParams): void {
	// Early exit: no feature hovered or missing coordinates
	if (!event.object || event.x == null || event.y == null) {
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
}
