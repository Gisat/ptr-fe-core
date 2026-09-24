/**
 * Characters a CSS colour can legitimately contain: hex digits, functional-notation
 * punctuation and separators, and the letters of a named colour.
 *
 * The resolved colour is written into a `style` attribute, so this acts as the guard
 * for that interpolation. A value failing it renders no swatch - the tooltip is then
 * simply uncoloured, rather than carrying a malformed attribute.
 */
const SAFE_COLOR_PATTERN = /^[#(),.%\s\w/-]+$/;

/** Class of the swatch element, shared by every tooltip flavour that renders one. */
export const TOOLTIP_SWATCH_CLASS = 'ptr-NativeMapTooltip-swatch';

/**
 * Builds the optional legend swatch shown in front of a tooltip value.
 *
 * Shared by the raster and vector tooltip builders so a swatch means the same thing -
 * and is sized and styled by the same CSS rule - wherever it appears. The app supplies
 * the colour through a hook (`CogTooltipSettings.resolveValueColor` for a raster value,
 * `TooltipAttribute.resolveValueColor` for a vector row) and is free to return nothing,
 * in which case the value is rendered without a swatch.
 *
 * @param color - Colour resolved by the app, or anything else for none.
 * @returns Swatch markup, or an empty string when there is no colour to show.
 */
export const buildTooltipSwatchHtml = (color: unknown): string =>
	typeof color === 'string' && SAFE_COLOR_PATTERN.test(color)
		? `<span class="${TOOLTIP_SWATCH_CLASS}" style="background-color: ${color}"></span>`
		: '';
