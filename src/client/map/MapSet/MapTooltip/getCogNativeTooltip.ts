import { readCogPixelValues } from '../../../shared/helpers/readCogPixelValues';
import { buildNativeTooltipResult, NativeTooltipResult } from './buildNativeTooltipResult';
import { buildTooltipSwatchHtml } from './buildTooltipSwatch';
import { CogTooltipSettings } from '../../../shared/models/models.tooltip';

/**
 * Builds a native DeckGL tooltip for a COG (Cloud Optimized GeoTIFF) layer.
 *
 * Reads the raster pixel value for the active channel via {@link readCogPixelValues},
 * formats it according to `cogBitmapOptions.tooltipSettings`, and returns a
 * {@link NativeTooltipResult} object.
 *
 * A consuming app can label the raw value by supplying
 * `tooltipSettings.resolveValueLabel`; when it returns a string, that label
 * replaces the value row. `tooltipSettings.resolveValueColor` adds a colour swatch
 * in front of it, and `tooltipSettings.isNoDataValue` suppresses the tooltip for
 * cells that carry nothing. ptr-fe-core does not interpret raster values itself,
 * because what a value means is dataset-specific.
 *
 * `tooltipSettings.hoverDelay` keeps this tooltip out of sight until the pointer
 * settles (see `settleReveal`), which is applied by the caller when the tooltips of
 * the hovered layers are merged.
 *
 * Returns `null` when:
 * - `cogBitmapOptions` is absent or `disableTooltip` is `true`.
 * - No pixel values are available at the cursor position.
 * - `tooltipSettings.isNoDataValue` reports the cell as having no data.
 *
 * @param params
 * @param params.info           - DeckGL picking info (typed loosely to access `info.bitmap`).
 * @param params.config         - Parsed datasource configuration for the layer.
 * @param params.verticalOffset - Fallback vertical offset (px) used when `tooltipSettings.offsetY`
 *                                is not set.
 * @returns DeckGL tooltip object or `null`.
 */
export function getCogNativeTooltip({
	info,
	config,
	verticalOffset,
}: {
	info: any;
	config: any;
	verticalOffset: number;
}): NativeTooltipResult | null {
	const cogBitmapOptions = config?.cogBitmapOptions;
	if (!cogBitmapOptions || cogBitmapOptions.disableTooltip) return null;

	// Resolve `useChannel` to a valid 1-based channel number and derive a 0-based index.
	const rawUseChannel = cogBitmapOptions.useChannel;
	const resolvedChannel =
		typeof rawUseChannel === 'number' && Number.isFinite(rawUseChannel) && rawUseChannel >= 1
			? Math.floor(rawUseChannel)
			: 1;
	const currentChannelIndex = resolvedChannel - 1;

	const values = readCogPixelValues(info, currentChannelIndex);
	if (!values || values.length === 0) return null;

	// Ensure the display index is within the bounds of the returned values array.
	// `readCogPixelValues` already validates channelIndex < channels, but return null to be safe.
	if (currentChannelIndex >= values.length) return null;
	const baseValue = values[currentChannelIndex];
	if (typeof baseValue !== 'number') return null;

	const tooltipSettings: CogTooltipSettings | undefined = cogBitmapOptions.tooltipSettings;

	// Cells the app reports as no data show nothing, rather than a sentinel value
	// that would read as a real measurement.
	if (tooltipSettings?.isNoDataValue?.(baseValue)) return null;

	const title = tooltipSettings?.title ?? '';
	const unit = tooltipSettings?.unit ?? '';
	const decimalPlaces = tooltipSettings?.decimalPlaces;

	let displayValue: number = baseValue;
	if (typeof decimalPlaces === 'number') {
		displayValue = Number(baseValue.toFixed(decimalPlaces));
	}
	const valueWithUnit = `${displayValue}${unit ? ` ${unit}` : ''}`;

	// Let the app name the value (e.g. the class a raster code stands for). A label
	// replaces the raw value, which would otherwise only repeat it.
	const valueLabel = tooltipSettings?.resolveValueLabel?.(baseValue);

	// Let the app colour the value to match the legend swatch it is drawn with. The
	// colour goes into a style attribute, so it is validated before being written out -
	// anything else renders no swatch rather than risking a malformed attribute.
	const valueColor = tooltipSettings?.resolveValueColor?.(baseValue);
	const swatchHtml = buildTooltipSwatchHtml(valueColor);

	const valueContent = valueLabel
		? `${swatchHtml}<span class="ptr-NativeMapTooltip-valueLabel">${valueLabel}</span>`
		: `<div class="ptr-NativeMapTooltip-row">
			${swatchHtml}<span class="ptr-NativeMapTooltip-value">${valueWithUnit}</span>
		</div>`;

	const html = `<div>
		${title ? `<div class="ptr-NativeMapTooltip-title">${title}</div>` : ''}
		${valueContent}
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
