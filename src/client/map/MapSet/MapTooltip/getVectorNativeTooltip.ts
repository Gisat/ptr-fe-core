import { PickingInfo } from '@deck.gl/core';
import { getTooltipAttributes } from '../../../shared/helpers/getTooltipAttributes';
import { buildNativeTooltipResult, NativeTooltipResult } from './buildNativeTooltipResult';
import { buildTooltipSwatchHtml } from './buildTooltipSwatch';
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
 * A row's `label` is optional. Declaring it names what the value describes (and a row
 * with only a label names the feature itself, e.g. `[DISTRICT] ([PROVINCE])`), while
 * leaving it out renders the value and its unit alone - the shape a row showing one
 * mapped value reads best in.
 *
 * A row can name the colour the map drew its feature with through
 * `attribute.resolveValueColor`; when it returns a colour, that row's value is
 * preceded by a small swatch, matching what a raster tooltip does for its value.
 * ptr-fe-core does not derive the colour itself, because what a feature's colour
 * means is app- and legend-specific - the same reason the raster hooks exist.
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
		.map(({ label, value, unit, resolveValueColor }) => {
			const valueStr = value == null ? '' : String(value);
			// Replace all [key] patterns in the label with the corresponding featureProperties value
			let displayLabel = label ?? '';
			if (displayLabel) {
				displayLabel = displayLabel.replace(/\[([^\]]+)]/g, (_, k) =>
					featureProperties[k] != null ? featureProperties[k] : `[${k}]`
				);
			}
			// A label says what the value describes, so it is optional: a row can also be just
			// the value with its unit, which is how app definitions usually read their mapped
			// value. Omitted rather than rendered empty, so the row carries no stray colon and
			// no element the value has to be laid out around.
			const labelHtml = displayLabel
				? `<span class="ptr-NativeMapTooltip-label">${displayLabel}${valueStr ? ':' : ''}</span>`
				: '';
			// The swatch belongs WITH the value rather than beside the row. Inside the value it
			// stays attached to the number it explains, and it takes the value's own spacing
			// towards the label with it, whether the row lays out as a plain inline line or as
			// a line of flex items (see `.ptr-NativeMapTooltip-sectionSpaced`).
			const swatchHtml = buildTooltipSwatchHtml(resolveValueColor?.({ value, properties: featureProperties }));

			return `<div class="ptr-NativeMapTooltip-row">
				${labelHtml}<span class="ptr-NativeMapTooltip-value">${swatchHtml}${valueStr}${unit ? ` ${unit}` : ''}</span>
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
