import type { CSSProperties } from 'react';

interface BuildNativeTooltipResultParams {
	/** HTML content string for the tooltip body. */
	html: string;
	/** CSS class name(s) for the tooltip container element. */
	className?: string;
	/** Custom inline styles merged on top of the base tooltip styles. */
	nativeStyles?: CSSProperties;
	/** Screen x-coordinate of the picking event (pixels). */
	x: number;
	/** Screen y-coordinate of the picking event (pixels). */
	y: number;
	/** Horizontal offset applied to the x position (pixels). */
	offsetX: number;
	/** Vertical offset applied to the y position (pixels). */
	offsetY: number;
}

/** Shape of the DeckGL tooltip return object produced by `getTooltip` callbacks. */
export interface NativeTooltipResult {
	html: string;
	className: string;
	style: CSSProperties;
}

/**
 * Assembles the DeckGL native tooltip return object from common parameters.
 *
 * Applies base styles (background, padding, positioning, transform) and merges any
 * user-supplied `nativeStyles` on top. The result is consumed directly by DeckGL's
 * `getTooltip` callback.
 *
 * @param params Tooltip rendering parameters.
 * @returns DeckGL tooltip object `{ html, className, style }`.
 */
export function buildNativeTooltipResult({
	html,
	className = '',
	nativeStyles,
	x,
	y,
	offsetX,
	offsetY,
}: BuildNativeTooltipResultParams): NativeTooltipResult {
	return {
		html,
		className,
		style: {
			backgroundColor: 'var(--base0)',
			padding: '6px 10px',
			left: `${x + offsetX}px`,
			top: `${y + offsetY}px`,
			transform: 'translate(-50%, -100%)',
			...nativeStyles,
		},
	};
}

