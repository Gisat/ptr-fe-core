import React from 'react';
import { MapTooltip } from './MapTooltip';
import { getTooltipAttributes } from '../../../shared/helpers/getTooltipAttributes';
import type { Selection } from '../../../shared/models/models.selections';
import type { Feature } from '../../../shared/models/models.feature';
import { Viewport } from '@deck.gl/core';
import { TooltipAttribute } from '../../../shared/models/models.tooltip';
// import { getFeatureCenter } from '../../../shared/helpers/getFeatureCentroid';

export interface LayerTooltipParams {
	tooltipSettings: {
		offsetX?: number;
		offsetY?: number;
		attributes: TooltipAttribute[];
		type?: 'native' | 'hover' | 'click' | 'selection';
	};
	featureInfo: { feature: Feature; x: number; y: number } | null;
	data: Feature[];
	selection?: Selection | null;
	viewport?: Viewport | null;
	CustomTooltip?: React.ElementType | boolean;
	getCoordinates: (feature: Feature) => [number, number] | undefined;
}

/**
 * Shared logic for rendering tooltips for map layers.
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
	const tooltipType = tooltipSettings?.type ?? (CustomTooltip ? 'hover' : 'native');
	if (!tooltipSettings || (tooltipType === 'native' && !CustomTooltip)) return null;

	const tooltipOffsetX = tooltipSettings.offsetX ?? 0;
	const tooltipOffsetY = tooltipSettings.offsetY ?? 0;
	const tooltipAttributes = tooltipSettings.attributes;

	let tooltip: React.ReactNode = null;

	// Hover / click tooltip
	if ((tooltipType === 'hover' || tooltipType === 'click') && featureInfo) {
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

	// Selection tooltip
	if (tooltipType === 'selection' && data.length && selection?.featureKeys?.length && viewport) {
		const selectedId = selection.featureKeys[0];
		const selectedFeature = data.find((f) => f.id === selectedId);

		const coordinates = selectedFeature ? getCoordinates(selectedFeature) : undefined;

		if (selectedFeature && coordinates) {
			const [px, py] = viewport.project(coordinates);
			const xPos = px + tooltipOffsetX;
			const yPos = py + tooltipOffsetY;
			const tooltipProperties = getTooltipAttributes(tooltipAttributes, selectedFeature.properties ?? selectedFeature);

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

	return tooltip;
}
