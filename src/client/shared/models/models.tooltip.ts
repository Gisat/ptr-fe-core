import type { CSSProperties } from 'react';

/**
 * Context handed to {@link TooltipAttribute.resolveValueColor}.
 */
export interface TooltipValueColorParams {
	/**
	 * Attribute value as it is shown, i.e. after `decimalPlaces` has been applied.
	 *
	 * Absent when the feature carries no such property, so a resolver must treat it as
	 * "nothing to colour" rather than as a value.
	 */
	value: string | number | undefined;
	/**
	 * Every property of the hovered feature.
	 *
	 * Provided because a layer may colour a feature by a different property than the one
	 * a row prints, and the swatch is meant to match the drawn feature either way.
	 */
	properties: Record<string, any>;
}

/**
 * Defines the shape of a single attribute to be displayed in a map tooltip.
 */
export interface TooltipAttribute {
	/** Property of the hovered feature whose value the row shows. */
	key: string;
	/**
	 * Text shown before the value, e.g. what the value describes. Optional.
	 *
	 * Supports `[key]` interpolation against the hovered feature's properties, which is
	 * how a row names the feature itself (`[DISTRICT] ([PROVINCE])`) - such a row declares
	 * no `key`, so it renders as text only.
	 *
	 * Leaving it out renders the value and its unit on their own, which is the shape a row
	 * showing a single mapped value reads best in: the layer's name and the legend already
	 * say what the number is, and a repeated caption only lengthens the tooltip.
	 */
	label?: string;
	value?: string | number;
	/** Unit printed after the value, e.g. `%` or `km²`. */
	unit?: string;
	decimalPlaces?: number;
	/**
	 * Optional resolver returning a CSS colour for this attribute's value, rendered as a
	 * small swatch in front of it.
	 *
	 * Lets a value be matched to the colour the map drew its feature with, which is the
	 * legend's job to know - hence a resolver rather than anything ptr-fe-core derives
	 * itself. App-owned for the same reason as `CogTooltipSettings.resolveValueColor`,
	 * which does the same for a raster value.
	 *
	 * The hook sits on the attribute rather than on the tooltip's settings because a
	 * vector tooltip shows several rows and only some of them describe a mapped value.
	 * Returning `undefined` renders no swatch, so a row opts out simply by not supplying
	 * one.
	 *
	 * @param params - The row's value plus the hovered feature's properties.
	 * @returns Any CSS colour (hex, `rgb()`, `rgba()`, ...), or `undefined` for none.
	 */
	resolveValueColor?: (params: TooltipValueColorParams) => string | undefined;
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
	/**
	 * Additional CSS class name(s) for the tooltip container.
	 *
	 * This is the supported seam for restyling tooltip content from the app, so the
	 * markup can stay owned by the shared package. When layers are merged into one
	 * tooltip, the classes are applied to that layer's own section as well, so
	 * `.my-layer .ptr-NativeMapTooltip-swatch { ... }` styles only the layer it was
	 * declared on rather than every layer in the box.
	 *
	 * - `nativeStyles` targets the single shared tooltip element, so in a merged tooltip
	 *   it applies to the whole box, not to one layer.
	 * - Prefer this class over `nativeStyles` for per-layer styling.
	 */
	nativeClassName?: string;
	/** Horizontal offset from the cursor position in pixels. */
	offsetX?: number;
	/** Vertical offset from the cursor position in pixels. */
	offsetY?: number;
	/** Tooltip interaction strategy. Defaults to Native. */
	type?: TooltipType;
	/**
	 * Milliseconds a layer's tooltip stays out of sight before it is revealed.
	 *
	 * Intended for layers whose value changes with nearly every hover, such as rasters:
	 * showing the value immediately makes the tooltip flicker, resize and shift under a
	 * moving pointer. The tooltip then appears once the pointer has been still for this
	 * long, which is when the value is actually being read.
	 *
	 * The hidden part takes up no room while it waits, so it cannot influence the
	 * tooltip's size and a moving pointer sees a stable box. The tooltip grows once,
	 * when the content appears.
	 *
	 * Applied to the layer's own section of the tooltip. When a delayed layer is
	 * hovered together with others, only its section waits, so values that describe
	 * the hovered feature - vector attributes, which do not change per hover - are
	 * still shown right away. Layers that do not set it are unaffected.
	 */
	hoverDelay?: number;
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
 * The raster pixel value is the main content, formatted by `unit` and
 * `decimalPlaces`, unless `resolveValueLabel` can name it instead.
 */
export interface CogTooltipSettings extends NativeTooltipSettings {
	/** Unit string appended to the displayed pixel value (e.g. "°C", "%"). */
	unit?: string;
	/** Number of decimal places to round the pixel value to before display. */
	decimalPlaces?: number;
	/**
	 * Optional resolver turning the raw pixel value into a human-readable label
	 * (e.g. the class name a raster code stands for).
	 *
	 * When it returns a string, that label is rendered **instead of** the raw
	 * value: naming the value is more useful than restating the code, and showing
	 * both would only duplicate the same information.
	 *
	 * The mapping is deliberately app-owned: what a raster value means depends on
	 * the dataset and its legend, both of which belong to the consuming
	 * application. Layers that do not supply a resolver keep the previous tooltip
	 * content.
	 *
	 * @param value - Raw pixel value read at the cursor, before `decimalPlaces` is applied.
	 * @returns Label to render, or `undefined` to fall back to the raw value.
	 */
	resolveValueLabel?: (value: number) => string | undefined;
	/**
	 * Optional resolver returning a CSS colour for the value, rendered as a small
	 * swatch in front of it.
	 *
	 * Lets the value be matched to the corresponding colour in the map legend, which
	 * is the legend's job to know - hence a resolver rather than anything ptr-fe-core
	 * derives itself.
	 *
	 * App-owned for the same reason as `resolveValueLabel`. Returning `undefined`
	 * renders no swatch, so a layer opts out simply by not supplying one.
	 *
	 * @param value - Raw pixel value read at the cursor.
	 * @returns Any CSS colour (hex, `rgb()`, `rgba()`, ...), or `undefined` for none.
	 */
	resolveValueColor?: (value: number) => string | undefined;
	/**
	 * Optional predicate marking pixel values that carry no data.
	 *
	 * When it returns `true`, no tooltip is rendered for the cell at all, instead of
	 * reporting a value that means "nothing here". Typical cases are sentinel codes
	 * (0, 255) and values outside the dataset's valid range.
	 *
	 * App-owned for the same reason as `resolveValueLabel`: which values are
	 * meaningful is dataset-specific.
	 *
	 * @param value - Raw pixel value read at the cursor.
	 * @returns True when the cell has no data and the tooltip should be suppressed.
	 */
	isNoDataValue?: (value: number) => boolean;
}
