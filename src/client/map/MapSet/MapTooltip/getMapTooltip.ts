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
import './getMapTooltip.css';

/**
 * Generates a DeckGL tooltip object for a hovered map feature if enabled.
 *
 * COG layers — configure via `cogBitmapOptions.tooltipSettings` (CogTooltipSettings):
 *   - `title`            optional label shown at the top of the tooltip.
 *   - `unit`             unit string appended to the pixel value (e.g. "°C", "%").
 *   - `decimalPlaces`    rounds the pixel value before display.
 *   - `nativeStyles`     inline CSS overrides for the tooltip container.
 *   - `nativeClassName`  additional CSS class(es) appended to the container.
 *   - `offsetX/Y`        pixel offset from the cursor position.
 *   Disable via `cogBitmapOptions.disableTooltip`.
 *
 * Vector layers — configure via `geojsonOptions.tooltipSettings` (VectorTooltipSettings):
 *   - `attributes`       array of attribute definitions (key, label, unit, decimalPlaces).
 *   - `title`            optional tooltip title.
 *   - `nativeStyles`     inline CSS overrides for the tooltip container.
 *   - `nativeClassName`  additional CSS class(es) appended to the container.
 *   - `offsetX/Y`        pixel offset from the cursor position.
 *   - `type`             tooltip strategy — only Native is handled here; Hover/Click/Selection
 *                        are delegated to getLayerTooltip.
 *   Supports `[key]` label interpolation from feature properties.
 *   Disable via `geojsonOptions.disableTooltip`.
 *
 * @param {Object} params
 * @param {PickingInfo} params.info - DeckGL picking info for the hovered feature.
 * @param {RenderingLayer[] | undefined} params.mapLayers - Map layers for configuration lookup.
 * @param {number} [params.verticalOffset=0] - Fallback vertical offset when no offsetY is configured.
 * @returns {Object|null} DeckGL tooltip object or null if not applicable.
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

	// Resolve layer config once – shared by both branches
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
