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
 * - Uses `selection` + `viewport` + `getCoordinates` for selection tooltips.
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
	// Resolve effective tooltip type:
	// - explicit type from settings has priority
	// - otherwise, if a CustomTooltip component is provided, default to TooltipType.Hover
	// - otherwise default to TooltipType.Native
	const tooltipType = tooltipSettings?.type ?? (CustomTooltip ? TooltipType.Hover : TooltipType.Native);

	// When tooltip is "native" and there is no CustomTooltip, we don't render anything ourselves.
	if (!tooltipSettings || (tooltipType === TooltipType.Native && !CustomTooltip)) {
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
				x: xPos,
				y: yPos,
				tooltipProperties,
			});
		} else {
			tooltip = <MapTooltip x={xPos} y={yPos} tooltipProperties={tooltipProperties} />;
		}
	}

	// ---------------------------------------------------------------------
	// Selection tooltip (feature centroid -> project through viewport)
	// ---------------------------------------------------------------------
	if (tooltipType === TooltipType.Selection) {
		if (!viewport) {
			console.warn('getLayerTooltip: selection tooltip requested but no viewport provided. Tooltip will not be shown.');
		} else if (!data.length || !selection?.featureKeys?.length) {
			console.warn(
				'getLayerTooltip: selection tooltip requested but no (fetched) data or no selected features. Tooltip will not be shown.'
			);
		} else {
			const selectedId = selection.featureKeys[0];
			const selectedFeature = data.find((f) => f.id === selectedId);

			if (!selectedFeature) {
				console.warn('getLayerTooltip: selection tooltip requested but selected feature not found in data.', {
					selectedId,
					featureKeys: selection.featureKeys,
				});
			} else {
				// Delegate coordinate computation to layer-specific function.
				const coordinates = getCoordinates(selectedFeature);

				if (!coordinates) {
					console.warn(
						'getLayerTooltip: getCoordinates returned no coordinate for selected feature. Tooltip will not be shown.',
						selectedFeature
					);
				} else {
					const [px, py] = viewport.project(coordinates);
					const xPos = px + tooltipOffsetX;
					const yPos = py + tooltipOffsetY;
					const tooltipProperties = getTooltipAttributes(
						tooltipAttributes,
						selectedFeature.properties ?? selectedFeature
					);

					if (CustomTooltip && typeof CustomTooltip === 'function') {
						tooltip = React.createElement(CustomTooltip, {
							x: xPos,
							y: yPos,
							tooltipProperties,
						});
					} else {
						tooltip = <MapTooltip x={xPos} y={yPos} tooltipProperties={tooltipProperties} />;
					}
				}
			}
		}
	}

	return tooltip;
}
