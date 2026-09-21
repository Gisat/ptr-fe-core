import { PickingInfo } from '@deck.gl/core';
import { RenderingLayer } from '../../../shared/models/models.layers';
import { parseDatasourceConfiguration } from '../../../shared/models/parsers.datasources';
import { buildNativeTooltipResult, NativeTooltipResult } from './buildNativeTooltipResult';
import { getCogNativeTooltip } from './getCogNativeTooltip';
import { getVectorNativeTooltip } from './getVectorNativeTooltip';
import {
	buildSectionsHtml,
	buildSettledTooltipHtml,
	buildSettledTooltipStyles,
	getLayerClassName,
	getLongestHoverDelay,
	readHoverDelay,
	TOOLTIP_BASE_CLASS,
} from './settleReveal';

/** One layer's contribution to the tooltip, with its own reveal delay. */
interface TooltipSection {
	/** Tooltip markup for that layer. */
	html: string;
	/** Element styles that layer's tooltip carried (offsets and chrome). */
	style: NativeTooltipResult['style'];
	/** Container classes that layer's tooltip carried. */
	className: string;
	/** Milliseconds this section stays hidden; `0` shows it right away. */
	hoverDelay: number;
}

function getRenderingLayerForPick(info: PickingInfo | any, mapLayers: RenderingLayer[] | undefined) {
	if (!Array.isArray(mapLayers)) return undefined;

	const pickedLayerId = info.layer?.id;
	const parentLayerId = info.layer?.parent?.id;
	const sourceLayerId = info.sourceLayer?.id;
	const candidateIds = [pickedLayerId, parentLayerId, sourceLayerId].filter(Boolean);

	return mapLayers.find((layer: RenderingLayer) =>
		candidateIds.some((id) => id === layer.key || String(id).startsWith(`${layer.key}-`))
	);
}

function getPickLayerKey(info: PickingInfo | any, mapLayer: RenderingLayer | undefined) {
	return mapLayer?.key ?? info.layer?.parent?.id ?? info.sourceLayer?.id ?? info.layer?.id;
}

function stripNativeTooltipIndicator(html: string) {
	return html.replace(/<div class="ptr-NativeMapTooltip-indicator"><\/div>/g, '');
}

/**
 * Generates a DeckGL native tooltip object for hovered map elements.
 *
 * Acts as a dispatcher: detects COG raster pixels and vector features, formats
 * every picked layer with enabled native tooltips, and merges them into one
 * tooltip when multiple layers overlap at the cursor.
 *
 * Layers control their own content, and a layer can ask for its part to stay out of
 * sight until the pointer settles (`tooltipSettings.hoverDelay`). Rasters use that,
 * because their value changes on nearly every hover and would otherwise make the
 * tooltip flicker and resize under a moving pointer. When every layer waits, the whole
 * tooltip waits; when only some do, the waiting sections disappear on their own so a
 * vector overlay still reads while a raster beneath it waits.
 *
 * @param params
 * @param params.info           - Primary DeckGL picking info for the hovered element.
 * @param params.infos          - Optional list from `deck.pickMultipleObjects`.
 * @param params.mapLayers      - Full list of rendering layers used to look up
 *                                datasource configuration by layer key.
 * @param params.verticalOffset - Fallback vertical offset (px) applied when no
 *                                `offsetY` is set in `tooltipSettings`.
 * @returns A DeckGL tooltip object `{ html, className, style }`, or `null`.
 */
export const getMapTooltip = ({
	info,
	infos,
	mapLayers,
	verticalOffset = 0,
}: {
	info: PickingInfo | any;
	infos?: (PickingInfo | any)[];
	mapLayers: RenderingLayer[] | undefined;
	verticalOffset: number;
}): NativeTooltipResult | null => {
	const pickedInfos = infos?.length ? infos : info ? [info] : [];
	if (!pickedInfos.length) return null;

	const pickedLayerKeys = new Set<string>();
	const tooltipResults: TooltipSection[] = [];

	for (const pickedInfo of pickedInfos) {
		if (!pickedInfo.layer) continue;

		const isCog = pickedInfo.bitmap && pickedInfo.layer.props.cogBitmapOptions;
		const isVector = !!pickedInfo.object;

		if (!isCog && !isVector) continue;

		const mapLayer = getRenderingLayerForPick(pickedInfo, mapLayers);
		const layerKey = getPickLayerKey(pickedInfo, mapLayer);
		if (layerKey) {
			if (pickedLayerKeys.has(layerKey)) continue;
			pickedLayerKeys.add(layerKey);
		}

		const config = parseDatasourceConfiguration(mapLayer?.datasource?.configuration);

		const tooltipResult = isCog
			? getCogNativeTooltip({ info: pickedInfo, config, verticalOffset })
			: getVectorNativeTooltip({ info: pickedInfo, config, verticalOffset });

		if (tooltipResult) {
			tooltipResults.push({
				// Kept as the layer built it, indicator included. Merging needs each layer's
				// indicator removed so the tooltip ends up with exactly one, but a single layer
				// has no merge to do and must keep its own - see the early return below.
				html: tooltipResult.html,
				style: tooltipResult.style,
				className: tooltipResult.className,
				hoverDelay: readHoverDelay(
					config?.cogBitmapOptions?.tooltipSettings ?? config?.geojsonOptions?.tooltipSettings
				),
			});
		}
	}

	if (!tooltipResults.length) return null;

	const anchorInfo = info ?? pickedInfos[0];
	const anchorTooltip = tooltipResults[0];
	// The tooltip element's chrome normally comes from a single layer's result.
	const baseStyles = anchorTooltip.style;
	const className = anchorTooltip.className;

	// Nothing waits: hand the single layer's tooltip over exactly as it built it, its own
	// indicator included.
	if (tooltipResults.length === 1 && !anchorTooltip.hoverDelay) {
		return buildNativeTooltipResult({
			html: anchorTooltip.html,
			className,
			nativeStyles: baseStyles,
			x: anchorInfo.x,
			y: anchorInfo.y,
			offsetX: 0,
			offsetY: 0,
		});
	}

	// Merging: the tooltip carries exactly one indicator, so each section contributes its
	// content only. Each layer's own classes move to its section, so styling one layer
	// does not spill onto the others; the shared box class stays on the element.
	const sections = tooltipResults.map((section) => ({
		...section,
		html: stripNativeTooltipIndicator(section.html),
		className: getLayerClassName(section.className),
	}));
	const mergedClassName = getLayerClassName(anchorTooltip.className)
		? // A layer asked for extra classes; on a merged box they would style every layer,
		  // so the box itself keeps only the shared class.
		  TOOLTIP_BASE_CLASS
		: anchorTooltip.className;

	const everySectionWaits = sections.every((section) => section.hoverDelay > 0);

	if (everySectionWaits) {
		// Raster-only maps: there is nothing worth showing while the pointer moves, so the
		// whole tooltip waits and appears in one piece - including its chrome, which is why
		// the element itself is left with none.
		const sectionsHtml = buildSectionsHtml(sections, false);

		return buildNativeTooltipResult({
			// The indicator goes INSIDE the wrapper so it appears together with the content.
			// Kept outside, it would hang in empty space during the delay: the content is
			// hidden but still occupies its box, leaving a triangle floating ~55px away from
			// the cursor with nothing attached to it.
			html: `<div>${buildSettledTooltipHtml(
				`${sectionsHtml}<div class="ptr-NativeMapTooltip-indicator"></div>`,
				getLongestHoverDelay(tooltipResults)
			)}</div>`,
			className: mergedClassName,
			nativeStyles: buildSettledTooltipStyles(baseStyles),
			x: anchorInfo.x,
			y: anchorInfo.y,
			offsetX: 0,
			offsetY: 0,
		});
	}

	// Mixed layers: only the waiting sections disappear, so a vector overlay still shows
	// its values while a raster beneath it waits.
	return buildNativeTooltipResult({
		html: `<div>${buildSectionsHtml(sections, true)}<div class="ptr-NativeMapTooltip-indicator"></div></div>`,
		className: mergedClassName,
		nativeStyles: baseStyles,
		x: anchorInfo.x,
		y: anchorInfo.y,
		offsetX: 0,
		offsetY: 0,
	});
};
