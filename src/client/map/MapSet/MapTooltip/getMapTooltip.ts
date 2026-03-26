import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../../shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { getTooltipAttributes } from '../../../shared/helpers/getTooltipAttributes';
import { readCogPixelValues } from '../../../shared/helpers/readCogPixelValues';
import { buildNativeTooltipResult } from './buildNativeTooltipResult';
import {
	CogTooltipSettings,
	TooltipAttribute,
	TooltipType,
	VectorTooltipSettings,
} from '../../../shared/models/models.tooltip';
import './tooltip.css';

/**
 * Generates a DeckGL native tooltip object for a hovered map element.
 *
 * Acts as a dispatcher: detects whether the hovered element is a COG raster
 * pixel or a vector feature and delegates to the appropriate builder.
 * Returns `null` when no tooltip should be shown (layer absent, tooltip
 * disabled, or no relevant data under the cursor).
 *
 * ---
 * **COG layers** — configure via `cogBitmapOptions.tooltipSettings` ({@link CogTooltipSettings}):
 *   - `title`           — optional label shown at the top of the tooltip.
 *   - `unit`            — unit string appended to the pixel value (e.g. `"°C"`, `"%"`).
 *   - `decimalPlaces`   — rounds the pixel value to this many decimal places before display.
 *   - `nativeStyles`    — inline CSS overrides for the tooltip container.
 *   - `nativeClassName` — additional CSS class(es) appended to the container.
 *   - `offsetX` / `offsetY` — pixel offset from the cursor position.
 *
 *   Disable entirely via `cogBitmapOptions.disableTooltip = true`.
 *
 * ---
 * **Vector layers** — configure via `geojsonOptions.tooltipSettings` ({@link VectorTooltipSettings}):
 *   - `attributes`      — array of {@link TooltipAttribute} definitions (`key`, `label`, `unit`, `decimalPlaces`).
 *   - `title`           — optional tooltip title.
 *   - `nativeStyles`    — inline CSS overrides for the tooltip container.
 *   - `nativeClassName` — additional CSS class(es) appended to the container.
 *   - `offsetX` / `offsetY` — pixel offset from the cursor position.
 *   - `type`            — tooltip strategy; only `TooltipType.Native` is handled here.
 *                         `Hover`, `Click`, and `Selection` are delegated to `getLayerTooltip`.
 *
 *   Label strings support `[key]` interpolation — occurrences of `[key]` are
 *   replaced with the corresponding value from the feature's properties.
 *
 *   Disable entirely via `geojsonOptions.disableTooltip = true`.
 *
 * @param params
 * @param params.info           - DeckGL picking info for the hovered element.
 *                                Typed loosely (`any`) because `info.bitmap`, `info.uv`,
 *                                and `info.tile` are not present on the base `PickingInfo`
 *                                type in deck.gl 9.3+.
 * @param params.mapLayers      - Full list of rendering layers used to look up the
 *                                datasource configuration by layer key.
 * @param params.verticalOffset - Fallback vertical offset (px) applied when no `offsetY`
 *                                is set in `tooltipSettings`. Defaults to `0`.
 * @returns A DeckGL tooltip object `{ html, className, style }` consumed by the
 *          `getTooltip` callback, or `null` when no tooltip should be rendered.
 */
export const getMapTooltip = ({
	info,
	mapLayers,
	verticalOffset = 0,
}: {
	info: PickingInfo | any; // `info.uv`, `info.bitmap`, and `info.tile` no longer exist on the base `PickingInfo` type in 9.3.0
	mapLayers: RenderingLayer[] | undefined;
	verticalOffset: number;
}) => {
	if (!info.layer) return null;

	const isCog = info.bitmap && info.layer.props.cogBitmapOptions;
	const isVector = !!info.object;

	if (!isCog && !isVector) return null;

	// Resolve layer config once — shared by both branches
	const mapLayer = Array.isArray(mapLayers)
		? mapLayers.find((layer: RenderingLayer) => layer.key === info.layer.id)
		: undefined;
	const config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

	if (isCog) {
		return getCogTooltip({ info, config, verticalOffset });
	}

	return getVectorTooltip({ info, config, verticalOffset });
};

// ---------------------------------------------------------------------------
// COG branch
// ---------------------------------------------------------------------------

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
function getCogTooltip({ info, config, verticalOffset }: { info: any; config: any; verticalOffset: number }) {
	const cogBitmapOptions = config?.cogBitmapOptions;
	if (!cogBitmapOptions || cogBitmapOptions.disableTooltip) return null;
	const currentChannelIndex = cogBitmapOptions.useChannel - 1;

	const values = readCogPixelValues(info, currentChannelIndex);
	if (!values) return null;

	const tooltipSettings: CogTooltipSettings | undefined = cogBitmapOptions.tooltipSettings;
	const title = tooltipSettings?.title ?? '';
	const unit = tooltipSettings?.unit ?? '';
	const decimalPlaces = tooltipSettings?.decimalPlaces;

	let displayValue: number = values[currentChannelIndex];
	if (typeof decimalPlaces === 'number') {
		displayValue = Number(values[currentChannelIndex].toFixed(decimalPlaces));
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

// ---------------------------------------------------------------------------
// Vector branch
// ---------------------------------------------------------------------------

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
function getVectorTooltip({
	info,
	config,
	verticalOffset,
}: {
	info: PickingInfo;
	config: any;
	verticalOffset: number;
}) {
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
		console.warn('[getMapTooltip] No valid tooltip attributes found for feature.', {
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
