import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../../shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { getTooltipAttributes, TooltipAttribute } from '../../../story/utils/getTooltipAttributes';
import './getMapTooltip.css';

/**
 * Generates a DeckGL tooltip object for a hovered map feature if enabled.
 *
 * - Uses layer configuration to determine tooltip attributes and formatting.
 * - Tooltip can be customized via geojsonOptions in datasource configuration with tooltipSettings:
 *    - attributes: array of attribute definitions (key, label, unit, decimalPlaces).
 *    - nativeStyles: custom CSS styles for tooltip container.
 *    - nativeClassName: additional CSS class names for tooltip container.
 *    - title: optional tooltip title.
 * - If no attributes are defined, tooltip will not be shown.
 * - Returns null if no feature or tooltip is disabled.
 * - Tooltip is styled and includes an indicator triangle.
 * - Supports dynamic label substitution: if label contains [key], it is replaced with the value from featureProperties[key].
 * - Ensures value and unit are always together in the same row.
 *
 * @param {Object} params
 * @param {PickingInfo} params.info - DeckGL picking info for the hovered feature.
 * @param {RenderingLayer[] | undefined} params.mapLayers - Array of map layers for configuration lookup.
 * @returns {Object|null} Tooltip object for DeckGL or null if not applicable.
 */
export const getMapTooltip = ({
	info,
	mapLayers,
	verticalOffset = 0,
}: {
	info: PickingInfo;
	mapLayers: RenderingLayer[] | undefined;
	verticalOffset: number;
}) => {
	// Early exit if no feature is hovered or layer is missing
	if (!info.object || !info.layer) return null;

	// Find the layer configuration for the hovered feature
	const layerId = info.layer.id;
	const mapLayer = Array.isArray(mapLayers)
		? mapLayers.find((layer: RenderingLayer) => layer.key === layerId)
		: undefined;
	const config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

	// Check if tooltip is enabled in layer config
	const tooltipEnabled = !config?.geojsonOptions?.disableTooltip;
	if (!tooltipEnabled) return null;

	const tooltipSettings = config?.geojsonOptions?.tooltipSettings;
	const tooltipStyles = tooltipSettings?.nativeStyles || {};
	const tooltipClassNames = `ptr-NativeMapTooltip ${tooltipSettings?.nativeClassName ?? ''}`;
	const tooltipTitle = tooltipSettings?.title || '';
	const featureProperties = info.object?.properties || {};

	let tooltipProperties: TooltipAttribute[] | undefined;

	// Use configured attributes if available
	if (tooltipSettings?.attributes && Array.isArray(tooltipSettings.attributes)) {
		tooltipProperties = getTooltipAttributes(tooltipSettings.attributes, featureProperties);
	}
	// If no valid tooltip properties, do not show tooltip
	if (!tooltipProperties || tooltipProperties.length === 0) {
		return null;
	}

	// Build HTML for tooltip content and indicator
	const tooltipHtml = `
    <div>
				${tooltipTitle ? `<div class="ptr-NativeMapTooltip-title">${tooltipTitle}</div>` : ''}
        ${tooltipProperties
					.map(({ key, label, value, unit }) => {
						const valueStr = value == null ? '' : String(value);

						// Replace all [key] patterns in the label with the corresponding featureProperties value
						let displayLabel = label;
						if (typeof label === 'string') {
							displayLabel = label.replace(/\[([^\]]+)\]/g, (_, k) =>
								featureProperties[k] != null ? featureProperties[k] : `[${k}]`
							);
						}

						return `<div class="ptr-NativeMapTooltip-row" key="${key}">
											<span class="ptr-NativeMapTooltip-label">${displayLabel + (valueStr ? ':' : '')}</span>
											<span class="ptr-NativeMapTooltip-value">
													${valueStr}${unit ? ` ${unit}` : ''}
											</span>
										</div>`;
					})
					.join('')}
        <div class="ptr-NativeMapTooltip-indicator"></div>
    </div>
`;

	// Return DeckGL tooltip object with styling and indicator
	return {
		html: tooltipHtml,
		className: tooltipClassNames,
		// Inline styles for positioning and appearance (is overriding default inline styles from deck.gl)
		style: {
			backgroundColor: 'var(--base0)',
			padding: '6px 10px',
			left: `${info.x}px`,
			top: `${info.y - verticalOffset}px`,
			transform: 'translate(-50%, -100%)',
			...tooltipStyles,
		},
	};
};
