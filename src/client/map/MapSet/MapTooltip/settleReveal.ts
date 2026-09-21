/**
 * Support for `tooltipSettings.hoverDelay`: keeping a layer's tooltip out of sight
 * until the pointer settles.
 *
 * Rasters change value on nearly every hover, so a raster tooltip shown immediately
 * flickers, resizes and shifts under a moving pointer. A layer can therefore ask for
 * its part of the tooltip - and, when it is the only layer, the whole tooltip - to
 * stay hidden until the pointer has been still for `hoverDelay`.
 *
 * The reveal has to be driven by CSS. DeckGL only asks for tooltip content while the
 * pointer moves - `getTooltip` runs from the hover pick - so there is no later moment
 * at which code could decide that the pointer has stopped. DeckGL reassigns the
 * tooltip's `innerHTML` on every hover, which recreates the elements below and
 * restarts their animations, so they stay hidden for as long as hovers keep arriving
 * and appear once they stop.
 *
 * The animations must sit on these elements rather than on the tooltip element: that
 * element persists across hovers, so an animation on it would never restart.
 *
 * Nothing is reserved for the hidden content. While it is out of sight its box
 * collapses to nothing, so it cannot influence the tooltip's size and a moving pointer
 * sees a stable box. The tooltip grows once, when the content appears.
 */

import type { CSSProperties } from 'react';

/**
 * Custom property carrying the settle delay, in milliseconds.
 *
 * Passed inline rather than through a class because the delay is per-layer
 * configuration and these elements are rebuilt on every hover.
 */
export const TOOLTIP_HOVER_DELAY_PROPERTY = '--ptr-native-map-tooltip-hover-delay';

/** Wrapper hiding every section of a tooltip whose layers all ask for a delay. */
export const TOOLTIP_SETTLE_CLASS = 'ptr-NativeMapTooltip-settle';

/**
 * Class on the tooltip element itself, carrying the box chrome.
 *
 * Named here so the merge can tell it apart from a layer's own classes: the box class
 * belongs on the tooltip element only, and letting it onto a section would give that
 * section the outer box's background, padding and border radius.
 */
export const TOOLTIP_BASE_CLASS = 'ptr-NativeMapTooltip';

/**
 * Returns just the classes a layer contributed, with the shared box class removed.
 *
 * @param className - A tooltip result's container classes.
 * @returns The layer-specific classes, space separated, or an empty string.
 */
export function getLayerClassName(className: string | undefined): string {
	return (className ?? '')
		.split(/\s+/)
		.filter((name) => name && name !== TOOLTIP_BASE_CLASS)
		.join(' ');
}

/** Wrapper hiding one layer's section while its delay runs. */
export const TOOLTIP_PENDING_SECTION_CLASS = 'ptr-NativeMapTooltip-pendingSection';

/** Class of one layer's block inside a merged tooltip. */
export const TOOLTIP_SECTION_CLASS = 'ptr-NativeMapTooltip-section';

/**
 * Modifier for a section that has another section above it.
 *
 * Set from the section's position rather than inferred in CSS, because a section can be
 * wrapped while it waits (see {@link TOOLTIP_PENDING_SECTION_CLASS}) - a sibling
 * selector such as `.section + .section` would then miss it.
 *
 * The gap belongs to the LOWER section, which is the one that waits in practice: the
 * tooltip is built from `pickMultipleObjects`, topmost layer first, and SLIM draws its
 * rasters below the vector overlays - so the raster, the only layer type that sets a
 * delay, is the last section. Its gap therefore collapses together with it, and the
 * layers above keep no leftover space.
 */
export const TOOLTIP_SECTION_SPACED_CLASS = 'ptr-NativeMapTooltip-sectionSpaced';

/**
 * Reads the settle delay configured on a layer's tooltip settings.
 *
 * Returns `0` when the layer does not ask for a delay, which callers treat as
 * "show this layer right away".
 *
 * @param tooltipSettings - Tooltip settings of the layer (either flavour).
 * @returns Delay in milliseconds, or `0` when unset or invalid.
 */
export function readHoverDelay(tooltipSettings: { hoverDelay?: number } | undefined): number {
	const hoverDelay = tooltipSettings?.hoverDelay;

	if (typeof hoverDelay !== 'number' || !Number.isFinite(hoverDelay) || hoverDelay <= 0) return 0;

	return hoverDelay;
}

/** Delay attribute shared by every element that waits. */
const delayAttribute = (hoverDelay: number) => `style="${TOOLTIP_HOVER_DELAY_PROPERTY}: ${hoverDelay}ms"`;

/**
 * Records the longest delay so a tooltip that is hidden as a whole appears as one
 * piece, rather than sections of it arriving at different moments.
 *
 * @param sections - Delays of the layers taking part in the tooltip.
 * @returns The longest delay in milliseconds.
 */
export function getLongestHoverDelay(sections: { hoverDelay: number }[]): number {
	return sections.reduce((longest, section) => Math.max(longest, section.hoverDelay), 0);
}

/**
 * Wraps a whole tooltip so nothing of it is drawn until the pointer settles.
 *
 * Used when every layer taking part asks for a delay, because then there is nothing
 * worth showing meanwhile. The wrapper also carries the tooltip's chrome, so that the
 * tooltip element itself can be left with no background or padding - otherwise an
 * empty padded box would keep tracking the cursor while the content is hidden. See
 * {@link buildSettledTooltipStyles}.
 *
 * The pointer indicator is deliberately left outside this wrapper, so it marks where
 * the tooltip is anchored even while the content is still hidden.
 *
 * @param contentHtml - The sections to reveal.
 * @param hoverDelay - Milliseconds the pointer must be still before revealing.
 * @returns HTML for the wrapper element.
 */
export function buildSettledTooltipHtml(contentHtml: string, hoverDelay: number): string {
	return `<div class="${TOOLTIP_SETTLE_CLASS}" ${delayAttribute(hoverDelay)}>${contentHtml}</div>`;
}

/**
 * Wraps one layer's section so it is hidden until the pointer settles.
 *
 * Used when the tooltip also holds layers that are shown right away: only the waiting
 * section disappears, so the pointer moving across a raster beneath a vector overlay
 * still shows the overlay's own values. The section's own spacing is inside the
 * wrapper, so it hides with the section rather than leaving a gap behind.
 *
 * @param sectionHtml - The section, including the gap above it.
 * @param hoverDelay - Milliseconds the pointer must be still before revealing.
 * @returns HTML for the wrapper element.
 */
export function buildPendingSectionHtml(sectionHtml: string, hoverDelay: number): string {
	return `<div class="${TOOLTIP_PENDING_SECTION_CLASS}" ${delayAttribute(hoverDelay)}>${sectionHtml}</div>`;
}

/**
 * Renders one layer's block inside a merged tooltip.
 *
 * The layer's own container classes are applied here, not only on the tooltip element,
 * so styling a single layer survives merging: a merged tooltip has many layers but only
 * one element, so a class kept solely there would either be lost or end up styling every
 * layer. This is what lets an app restyle one layer's content (see
 * `tooltipSettings.nativeClassName`) without owning the markup.
 *
 * @param html - Tooltip markup produced for that layer.
 * @param spaced - Whether another section sits above this one, in which case it adds a
 *   little room so the layers do not read as one block.
 * @param className - The layer's container classes, applied to the section.
 * @returns HTML for the section element.
 */
export function buildSectionHtml(html: string, spaced: boolean, className: string): string {
	const classes = [TOOLTIP_SECTION_CLASS, spaced ? TOOLTIP_SECTION_SPACED_CLASS : '', className]
		.filter(Boolean)
		.join(' ');

	return `<div class="${classes}">${html}</div>`;
}

/**
 * Renders the layers of a merged tooltip as sections, hiding the ones that wait.
 *
 * Sections are stacked with a gap rather than separated by a rule: the layers are
 * already told apart by their titles and formats, and a line between them only adds
 * noise to a small box. The gap sits on the lower section, which is where the waiting
 * layer is, so a hidden section takes its gap with it and never leaves empty space.
 *
 * @param sections - Layer results in paint order, each collapsed to the parts this
 *   module needs.
 * @param wrapWaitingSections - True to hide each waiting section on its own, which
 *   keeps the layers that are ready readable. False when the caller hides the whole
 *   tooltip instead, which happens when every section waits.
 * @returns Concatenated section markup.
 */
export function buildSectionsHtml(
	sections: { html: string; hoverDelay: number; className?: string }[],
	wrapWaitingSections: boolean
): string {
	return sections
		.map((section, index) => {
			const sectionHtml = buildSectionHtml(section.html, index > 0, section.className ?? '');

			return wrapWaitingSections && section.hoverDelay > 0
				? buildPendingSectionHtml(sectionHtml, section.hoverDelay)
				: sectionHtml;
		})
		.join('');
}

/**
 * Strips the tooltip chrome from the tooltip element while its content is hidden.
 *
 * While a settling tooltip is fully collapsed, anything the element still draws would
 * stay visible - an empty padded box tracking the cursor. Clearing the chrome here
 * means the content wrapper is the only thing that paints.
 *
 * @param styles - Element styles normally applied to the tooltip (that of the first
 *   contributing layer, which carries the offsets and chrome).
 * @returns Styles with the chrome removed, keeping positioning and offsets.
 */
export function buildSettledTooltipStyles(styles: CSSProperties): CSSProperties {
	return {
		...styles,
		backgroundColor: 'transparent',
		boxShadow: 'none',
		padding: 0,
	};
}
