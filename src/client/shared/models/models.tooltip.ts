import type { CSSProperties } from 'react';

/**
 * Defines the shape of a single attribute to be displayed in a map tooltip.
 */
export interface TooltipAttribute {
	key: string;
	label?: string;
	value?: string | number;
	unit?: string;
	decimalPlaces?: number;
}

/**
 * Supported tooltip behavior modes.
 */
export enum TooltipType {
	Native = 'native',
	Hover = 'hover',
	Click = 'click',
	Selection = 'selection',
}

/**
 * Base settings shared by all native DeckGL tooltip variants.
 */
export interface NativeTooltipSettings {
	/** Optional title displayed at the top of the tooltip. */
	title?: string;
	/** Custom inline CSS styles applied to the tooltip container (overrides defaults). */
	nativeStyles?: CSSProperties;
	/** Additional CSS class name(s) appended to the tooltip container. */
	nativeClassName?: string;
	/** Horizontal offset from the cursor position in pixels. */
	offsetX?: number;
	/** Vertical offset from the cursor position in pixels. */
	offsetY?: number;
	/** Tooltip interaction strategy. Defaults to Native. */
	type?: TooltipType;
}

/**
 * Tooltip settings for vector layers (geojsonOptions.tooltipSettings).
 */
export interface VectorTooltipSettings extends NativeTooltipSettings {
	/** Attribute definitions driving the tooltip rows. */
	attributes: TooltipAttribute[];
}

/**
 * Tooltip settings for COG (Cloud Optimized GeoTIFF) layers (cogBitmapOptions.tooltipSettings).
 * The raster pixel value is always the main content; unit and decimalPlaces format it.
 */
export interface CogTooltipSettings extends NativeTooltipSettings {
	/** Unit string appended to the displayed pixel value (e.g. "°C", "%"). */
	unit?: string;
	/** Number of decimal places to round the pixel value to before display. */
	decimalPlaces?: number;
}
