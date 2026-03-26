import { PickingInfo } from '@deck.gl/core';
import { getTooltipAttributes } from '../../../shared/helpers/getTooltipAttributes';
import { buildNativeTooltipResult, NativeTooltipResult } from './buildNativeTooltipResult';
import { TooltipAttribute, TooltipType, VectorTooltipSettings } from '../../../shared/models/models.tooltip';

/**
 * Builds a native DeckGL tooltip for a vector (GeoJSON / MVT / icon) layer.
 *
 * Only handles `TooltipType.Native` — if `tooltipSettings.type` is `Hover`,
 * `Click`, or `Selection` this function returns `null` and those modes are
 * handled by `getLayerTooltip` instead.
 *
 * Attribute values are derived from the hovered feature's properties via
 * {@link getTooltipAttributes}. Label strings support `[key]` interpolation:
 * every `[key]` occurrence is replaced with the corresponding property value.
 *
 * Returns `null` when:
 * - `geojsonOptions.disableTooltip` is `true`.
 * - The effective tooltip type is not `Native`.
 * - No valid tooltip attributes are resolved from the feature's properties.
 *
 * @param params
 * @param params.info           - DeckGL picking info for the hovered vector feature.
 * @param params.config         - Parsed datasource configuration for the layer.
 * @param params.verticalOffset - Fallback vertical offset (px) used when `tooltipSettings.offsetY`
 *                                is not set.
 * @returns DeckGL tooltip object or `null`.
 */
export function getVectorNativeTooltip({
	info,
	config,
	verticalOffset,
}: {
	info: PickingInfo;
	config: any;
	verticalOffset: number;
}): NativeTooltipResult | null {
	if (config?.geojsonOptions?.disableTooltip) return null;

	const tooltipSettings: VectorTooltipSettings | undefined = config?.geojsonOptions?.tooltipSettings;

	// Only Native tooltips are handled here; Hover/Click/Selection are handled by getLayerTooltip
	if ((tooltipSettings?.type ?? TooltipType.Native) !== TooltipType.Native) return null;

	const featureProperties = info.object?.properties ?? info.object ?? {};

	let tooltipProperties: TooltipAttribute[] | undefined;
	if (tooltipSettings?.attributes && Array.isArray(tooltipSettings.attributes)) {
		tooltipProperties = getTooltipAttributes(tooltipSettings.attributes, featureProperties);
	}

	if (!tooltipProperties?.length) {
		console.warn('[getVectorNativeTooltip] No valid tooltip attributes found for feature.', {
			featureProperties,
			tooltipSettings,
		});
		return null;
	}

	const title = tooltipSettings?.title ?? '';

	const rows = tooltipProperties
		.map(({ label, value, unit }) => {
			const valueStr = value == null ? '' : String(value);
			// Replace all [key] patterns in the label with the corresponding featureProperties value
			let displayLabel = label ?? '';
			if (displayLabel) {
				displayLabel = displayLabel.replace(/\[([^\]]+)]/g, (_, k) =>
					featureProperties[k] != null ? featureProperties[k] : `[${k}]`
				);
			}
			return `<div class="ptr-NativeMapTooltip-row">
				<span class="ptr-NativeMapTooltip-label">${displayLabel + (displayLabel && valueStr ? ':' : '')}</span>
				<span class="ptr-NativeMapTooltip-value">${valueStr}${unit ? ` ${unit}` : ''}</span>
			</div>`;
		})
		.join('');

	const html = `<div>
		${title ? `<div class="ptr-NativeMapTooltip-title">${title}</div>` : ''}
		${rows}
		<div class="ptr-NativeMapTooltip-indicator"></div>
	</div>`;

	return buildNativeTooltipResult({
		html,
		className: `ptr-NativeMapTooltip ${tooltipSettings?.nativeClassName ?? ''}`.trim(),
		nativeStyles: tooltipSettings?.nativeStyles,
		x: info.x,
		y: info.y,
		offsetX: tooltipSettings?.offsetX ?? 0,
		offsetY: tooltipSettings?.offsetY ?? verticalOffset,
	});
}
