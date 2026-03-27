import { readCogPixelValues } from '../../../shared/helpers/readCogPixelValues';
import { buildNativeTooltipResult, NativeTooltipResult } from './buildNativeTooltipResult';
import { CogTooltipSettings } from '../../../shared/models/models.tooltip';

/**
 * Builds a native DeckGL tooltip for a COG (Cloud Optimized GeoTIFF) layer.
 *
 * Reads the raster pixel value for the active channel via {@link readCogPixelValues},
 * formats it according to `cogBitmapOptions.tooltipSettings`, and returns a
 * {@link NativeTooltipResult} object.
 *
 * Returns `null` when:
 * - `cogBitmapOptions` is absent or `disableTooltip` is `true`.
 * - No pixel values are available at the cursor position.
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
			? rawUseChannel
			: 1;
	const currentChannelIndex = resolvedChannel - 1;

	const values = readCogPixelValues(info, currentChannelIndex);
	if (!values || !Array.isArray(values) || values.length === 0) return null;

	// Ensure the index we use for display is within bounds of the returned values array.
	const safeIndex =
		currentChannelIndex >= 0 && currentChannelIndex < values.length ? currentChannelIndex : 0;
	const baseValue = values[safeIndex];
	if (typeof baseValue !== 'number') return null;

	const tooltipSettings: CogTooltipSettings | undefined = cogBitmapOptions.tooltipSettings;
	const title = tooltipSettings?.title ?? '';
	const unit = tooltipSettings?.unit ?? '';
	const decimalPlaces = tooltipSettings?.decimalPlaces;

	let displayValue: number = baseValue;
	if (typeof decimalPlaces === 'number') {
		displayValue = Number(baseValue.toFixed(decimalPlaces));
	}
	const valueWithUnit = `${displayValue}${unit ? ` ${unit}` : ''}`;

	const html = `<div>
		${title ? `<div class="ptr-NativeMapTooltip-title">${title}</div>` : ''}
		<div class="ptr-NativeMapTooltip-row">
			<span class="ptr-NativeMapTooltip-value">${valueWithUnit}</span>
		</div>
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
