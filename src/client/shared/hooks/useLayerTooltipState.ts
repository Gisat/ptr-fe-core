import { useCallback, useState } from 'react';
import type { PickingInfo } from '@deck.gl/core';
import { TooltipInfo, TooltipType } from '../models/models.tooltip';
import type { MapFeature } from '../models/models.mapFeature';
import { getFeatureId } from '../helpers/getFeatureId';
import { readCogPixelValues } from '../helpers/readCogPixelValues';
import type { CogBitmapOptions } from '../models/parsers.datasources';
// ---------------------------------------------------------------------------
// Hook params
// ---------------------------------------------------------------------------
/**
 * Configuration for the {@link useLayerTooltipState} hook.
 */
export interface UseLayerTooltipStateParams {
	/** Resolved tooltip interaction mode for this layer. */
	tooltipType: TooltipType;
	/** Whether tooltips are enabled for this layer (`!disableTooltip`). */
	tooltipEnabled: boolean;
	/** Property key used to identify features (needed for click-toggle logic). */
	featureIdProperty?: string;
	/**
	 * COG bitmap options — when provided the hook treats picking info as raster
	 * pixel data instead of vector feature data.
	 */
	cogBitmapOptions?: CogBitmapOptions;
}
// ---------------------------------------------------------------------------
// Hook return
// ---------------------------------------------------------------------------
/**
 * Return value of {@link useLayerTooltipState}.
 */
export interface UseLayerTooltipStateReturn {
	/** Current tooltip info (feature or pixel), or `null` when nothing is shown. */
	tooltipInfo: TooltipInfo | null;
	/** Handler to attach to deck.gl `onHover`. */
	onHover: (info: PickingInfo) => void;
	/** Handler to attach to deck.gl `onClick`. */
	onClick: (info: PickingInfo) => void;
	/** Handler to attach to deck.gl `onDrag`. */
	onDrag: () => void;
}
// ---------------------------------------------------------------------------
// Hook implementation
// ---------------------------------------------------------------------------
/**
 * Manages tooltip state (hover / click / drag) for a single map layer.
 *
 * Eliminates the duplicated `featureInfo` / `pixelInfo` `useState` +
 * `onHover` / `onClick` / `onDrag` handlers that were previously
 * copy-pasted across `GeojsonLayerSource`, `IconLayerSource` and
 * `COGLayerSource`.
 *
 * @param params - Hook configuration.
 * @returns Tooltip state and deck.gl event handlers.
 *
 * @example
 * `	sx
 * const { tooltipInfo, onHover, onClick, onDrag } = useLayerTooltipState({
 *   tooltipType,
 *   tooltipEnabled,
 *   featureIdProperty: geojsonOptions?.featureIdProperty,
 * });
 * `
 */
export function useLayerTooltipState({
	tooltipType,
	tooltipEnabled,
	featureIdProperty,
	cogBitmapOptions,
}: UseLayerTooltipStateParams): UseLayerTooltipStateReturn {
	const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo | null>(null);
	// -----------------------------------------------------------------------
	// COG (pixel) hover
	// -----------------------------------------------------------------------
	const handleCogHover = useCallback(
		(info: PickingInfo) => {
			if (!cogBitmapOptions) return;
			const channelIndex = cogBitmapOptions.useChannel - 1;
			const values = readCogPixelValues(info, channelIndex);
			if (!values) {
				setTooltipInfo(null);
			} else {
				setTooltipInfo({
					kind: 'pixel',
					x: info.x,
					y: info.y,
					values,
					currentChannelIndex: channelIndex,
				});
			}
		},
		[cogBitmapOptions],
	);
	// -----------------------------------------------------------------------
	// Vector (feature) hover
	// -----------------------------------------------------------------------
	const handleVectorHover = useCallback(
		(info: PickingInfo) => {
			if (info.object && info.x != null && info.y != null) {
				setTooltipInfo({
					kind: 'feature',
					feature: info.object as MapFeature,
					x: info.x,
					y: info.y,
				});
			} else {
				setTooltipInfo(null);
			}
		},
		[],
	);
	// -----------------------------------------------------------------------
	// Unified onHover
	// -----------------------------------------------------------------------
	const onHover = useCallback(
		(info: PickingInfo) => {
			if (!tooltipEnabled || tooltipType !== TooltipType.Hover) return;
			if (cogBitmapOptions) {
				handleCogHover(info);
			} else {
				handleVectorHover(info);
			}
		},
		[tooltipEnabled, tooltipType, cogBitmapOptions, handleCogHover, handleVectorHover],
	);
	// -----------------------------------------------------------------------
	// onClick — vector only, toggle-off-on-same-feature
	// -----------------------------------------------------------------------
	const onClick = useCallback(
		(info: PickingInfo) => {
			if (!tooltipEnabled || tooltipType !== TooltipType.Click) return;
			const clickedFeature = info.object as MapFeature | null;
			if (!clickedFeature || info.x == null || info.y == null) {
				setTooltipInfo(null);
				return;
			}
			// Toggle off if the same feature is clicked again
			const currentId =
				tooltipInfo?.kind === 'feature'
					? getFeatureId(tooltipInfo.feature, featureIdProperty)
					: null;
			const clickedId = getFeatureId(clickedFeature, featureIdProperty);
			if (currentId && clickedId && currentId === clickedId) {
				setTooltipInfo(null);
			} else {
				setTooltipInfo({
					kind: 'feature',
					feature: clickedFeature,
					x: info.x,
					y: info.y,
				});
			}
		},
		[tooltipEnabled, tooltipType, tooltipInfo, featureIdProperty],
	);
	// -----------------------------------------------------------------------
	// onDrag — clear tooltip to avoid stale screen positions
	// -----------------------------------------------------------------------
	const onDrag = useCallback(() => {
		if (tooltipEnabled) {
			setTooltipInfo(null);
		}
	}, [tooltipEnabled]);
	return { tooltipInfo, onHover, onClick, onDrag };
}