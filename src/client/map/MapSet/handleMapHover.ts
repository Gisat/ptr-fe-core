import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../shared/models/parsers.datasources';

/**
 * Parameters for handleMapHover function.
 * @property {PickingInfo} event - DeckGL picking event.
 * @property {RenderingLayer[] | undefined} mapLayers - Array of map layers.
 * @property {(isHovered: boolean) => void} setLayerIsHovered - Function to set hover state.
 */
interface HandleMapHoverParams {
	event: PickingInfo;
	mapLayers: RenderingLayer[] | undefined;
	setLayerIsHovered: (isHovered: boolean) => void;
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

	const config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

	// Update hover state for cursor feedback
	const selectionsEnabled = !config?.geojsonOptions?.disableSelections;
	setLayerIsHovered(selectionsEnabled && !!layerId);
}
