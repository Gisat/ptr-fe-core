import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from 'src/client/shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../shared/models/parsers.datasources';

/**
 * Tooltip attribute definition.
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
 */
interface TooltipState {
	x: number;
	y: number;
	tooltipProperties: TooltipAttribute[];
}

/**
 * Parameters for handleMapHover function.
 */
interface HandleMapHoverParams {
	event: PickingInfo;
	mapLayers: RenderingLayer[] | undefined;
	setTooltip: (tooltip: TooltipState | null) => void;
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
 */
export function handleMapHover({ event, mapLayers, setTooltip, setLayerIsHovered }: HandleMapHoverParams) {
	// If no feature is hovered or coordinates are missing, clear tooltip and hover state
	if (!event.object || event.x == null || event.y == null) {
		setTooltip(null);
		setLayerIsHovered(false);
		return;
	}

	// Find the layer configuration for the hovered feature
	const layerId = event?.layer?.id;
	const mapLayer = Array.isArray(mapLayers)
		? mapLayers.find((layer: RenderingLayer) => layer.key === layerId)
		: undefined;
	const config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

	// Check if selections are enabled for cursor feedback
	const selectionsEnabled = !config?.geojsonOptions?.disableSelections;
	setLayerIsHovered(selectionsEnabled && !!layerId);

	// Check if tooltip is enabled
	const tooltipEnabled = !config?.geojsonOptions?.disableTooltip;
	if (!tooltipEnabled) {
		setTooltip(null);
		return;
	}

	const tooltipSettings = config?.geojsonOptions?.tooltipSettings;
	const featureProperties = event.object?.properties;

	let tooltipProperties: TooltipAttribute[] | undefined;

	// If tooltip attributes are defined in settings, use them
	if (tooltipSettings?.attributes && Array.isArray(tooltipSettings.attributes)) {
		tooltipProperties = tooltipSettings.attributes
			.map((attribute: TooltipAttribute) => {
				let value = featureProperties[attribute.key];
				// Round value if decimalPlaces is specified and value is a number
				if (typeof value === 'number' && typeof attribute.decimalPlaces === 'number') {
					value = Number(value.toFixed(attribute.decimalPlaces));
				}
				return {
					key: attribute.key,
					label: attribute.label ?? 'Value',
					value,
					unit: attribute.unit ?? '',
				};
			})
			.filter((attr) => attr.value !== undefined && attr.value !== null);
	}
	// If no attributes, use 'value' property if present
	else if (featureProperties?.value !== undefined) {
		tooltipProperties = [
			{
				key: 'value',
				label: 'Value',
				value: featureProperties.value,
				unit: '',
			},
		];
	}

	// If no tooltipProperties found, don't show tooltip
	if (!tooltipProperties || tooltipProperties.length === 0) {
		setTooltip(null);
		return;
	}

	// Set tooltip state with position and properties
	setTooltip({
		x: event.x,
		y: event.y,
		tooltipProperties,
	});
}
