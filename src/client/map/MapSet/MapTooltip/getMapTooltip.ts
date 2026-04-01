import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../../shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { getCogNativeTooltip } from './getCogNativeTooltip';
import { getVectorNativeTooltip } from './getVectorNativeTooltip';

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
		return getCogNativeTooltip({ info, config, verticalOffset });
	}

	return getVectorNativeTooltip({ info, config, verticalOffset });
};
