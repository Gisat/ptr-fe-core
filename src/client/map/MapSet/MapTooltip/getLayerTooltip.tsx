import React from 'react';
import { Viewport } from '@deck.gl/core';
import { MapTooltip } from './MapTooltip';
import { getTooltipAttributes } from '../../../shared/helpers/getTooltipAttributes';
import type { Selection } from '../../../shared/models/models.selections';
import type { MapFeature } from '../../../shared/models/models.mapFeature';
import { TooltipAttribute } from '../../../shared/models/models.tooltip';
import { TooltipType } from '../../../shared/models/models.tooltip';

export interface LayerTooltipParams {
	/** Tooltip visual/config settings coming from layer definition. */
	tooltipSettings: {
		offsetX?: number;
		offsetY?: number;
		attributes: TooltipAttribute[];
		/**
		 * Tooltip strategy:
		 * - TooltipType.Native   – let DeckGL handle it, or MapTooltip if CustomTooltip=false
		 * - TooltipType.Hover    – show tooltip for hovered feature
		 * - TooltipType.Click    – show tooltip for clicked feature
		 * - TooltipType.Selection– show tooltip for currently selected feature
		 */
		type?: TooltipType.Native | TooltipType.Hover | TooltipType.Click | TooltipType.Selection;
	};
	/** Info about the currently hovered/clicked feature (screen position + feature). */
	featureInfo: { feature: MapFeature; x: number; y: number } | null;
	/** Features used for selection-based tooltips (typically all rendered features). */
	data: MapFeature[];
	/** Active selection state for the layer (may be null if not selectable). */
	selection?: Selection | null;
	/** Current DeckGL viewport used for projecting [lng, lat] to screen coords. */
	viewport?: Viewport | null;
	/** Optional custom tooltip React component; when false, MapTooltip is used. */
	CustomTooltip?: React.ElementType | boolean;
	/**
	 * Layer-specific function that returns a flat [lng, lat] coordinate
	 * for a given feature (e.g. centroid for polygons, position for points).
	 */
	getCoordinates: (feature: MapFeature) => [number, number] | undefined;
}

/**
 * Shared logic for rendering hover/click/selection tooltips for map layers.
 *
 * - Uses `featureInfo` for hover/click tooltips (screen-space x/y already known).
 * - Uses `selection.featureKeys` (potentially multiple) + `viewport` + `getCoordinates`
 *   for selection tooltips, rendering one tooltip per selected feature.
 * - Falls back to "native" tooltips when requested and no CustomTooltip is provided.
 *
 * @param params Tooltip configuration and layer state.
 * @returns Tooltip React node or null if no tooltip should be rendered.
 */
export function getLayerTooltip({
	tooltipSettings,
	featureInfo,
	data,
	selection,
	viewport,
	CustomTooltip,
	getCoordinates,
}: LayerTooltipParams): React.ReactNode {
	// Does the layer provide any tooltip configuration?
	const hasTooltipSettings = !!tooltipSettings;
	// Is a real React component provided (not just `true` / `false`)?
	const hasCustomTooltipComponent = !!CustomTooltip && typeof CustomTooltip === 'function';

	/**
	 * Early exit: no tooltip settings provided
	 */
	if (!hasTooltipSettings) {
		console.warn('getLayerTooltip: No tooltipSettings provided, cannot show any tooltip content.');
		return null;
	}

	/**
	 * Resolve effective tooltip type:
	 * - explicit type from settings has priority
	 * - otherwise, if a CustomTooltip component is provided, default to Hover
	 * - otherwise fall back to Native (DeckGL-managed)
	 */
	let tooltipType: TooltipType =
		tooltipSettings?.type ?? (hasCustomTooltipComponent ? TooltipType.Hover : TooltipType.Native);

	/**
	 * If the user configured "native" but also provided a CustomTooltip component,
	 * treat it as "hover with custom component" – there is nothing for us to render
	 * in pure native mode.
	 */
	if (tooltipType === TooltipType.Native && hasCustomTooltipComponent) {
		tooltipType = TooltipType.Hover;
	}

	/**
	 * When tooltip type is "native" and there is no CustomTooltip component,
	 * we don't render anything. DeckGL will handle its own native tooltip.
	 */
	if (tooltipType === TooltipType.Native && !hasCustomTooltipComponent) {
		return null;
	}

	// Normalize settings with sane fallbacks
	const tooltipOffsetX = tooltipSettings.offsetX ?? 0;
	const tooltipOffsetY = tooltipSettings.offsetY ?? 0;
	const tooltipAttributes = tooltipSettings.attributes ?? [];

	let tooltip: React.ReactNode = null;

	// ---------------------------------------------------------------------
	// Hover / click tooltip (uses screen x/y from featureInfo directly)
	// ---------------------------------------------------------------------
	if ((tooltipType === TooltipType.Hover || tooltipType === TooltipType.Click) && featureInfo) {
		const { feature, x, y } = featureInfo;
		const tooltipProperties = getTooltipAttributes(tooltipAttributes, feature?.properties ?? feature);
		const xPos = x + tooltipOffsetX;
		const yPos = y + tooltipOffsetY;

		if (CustomTooltip && typeof CustomTooltip === 'function') {
			tooltip = React.createElement(CustomTooltip, {
				feature,
				x: xPos,
				y: yPos,
				tooltipProperties,
			});
		} else {
			tooltip = <MapTooltip x={xPos} y={yPos} tooltipProperties={tooltipProperties} />;
		}
	}

	// ---------------------------------------------------------------------
	// Selection tooltip(s) (feature centroid(s) -> project through viewport)
	// Renders one tooltip per selected feature key in `selection.featureKeys`.
	// ---------------------------------------------------------------------
	if (tooltipType === TooltipType.Selection) {
		if (!viewport) {
			console.warn('getLayerTooltip: selection tooltip requested but no viewport provided. Tooltip will not be shown.');
		} else if (!selection || !selection.featureKeys?.length) {
			// No selection – nothing to render
			return null;
		} else if (!data.length) {
			console.warn(
				'getLayerTooltip: selection tooltip requested but no (fetched) data available. Tooltip will not be shown.'
			);
		} else {
			const selectedIds = selection.featureKeys;
			const tooltips: React.ReactNode[] = [];

			for (const selectedId of selectedIds) {
				const selectedFeature = data.find((f) => f.id === selectedId);
				if (!selectedFeature) {
					console.warn('getLayerTooltip: selected feature not found in data for selection tooltip.', { selectedId });
					continue;
				}

				const coordinates = getCoordinates(selectedFeature);
				if (!coordinates) {
					console.warn(
						'getLayerTooltip: getCoordinates returned no coordinate for selected feature. Tooltip will not be shown for this feature.',
						selectedFeature
					);
					continue;
				}

				const [px, py] = viewport.project(coordinates);
				const xPos = px + tooltipOffsetX;
				const yPos = py + tooltipOffsetY;
				const tooltipProperties = getTooltipAttributes(
					tooltipAttributes,
					selectedFeature.properties ?? selectedFeature
				);

				if (CustomTooltip && typeof CustomTooltip === 'function') {
					tooltips.push(
						React.createElement(CustomTooltip, {
							key: selectedId,
							feature: selectedFeature,
							x: xPos,
							y: yPos,
							tooltipProperties,
						})
					);
				} else {
					tooltips.push(<MapTooltip key={selectedId} x={xPos} y={yPos} tooltipProperties={tooltipProperties} />);
				}
			}

			if (tooltips.length) {
				tooltip = tooltips;
			}
		}
	}

	return tooltip;
}
