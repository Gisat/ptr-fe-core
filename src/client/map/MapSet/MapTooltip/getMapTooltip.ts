import { useCallback } from 'react';
import './mapTooltip.css';
import { PickingInfo } from '@deck.gl/core';
import { TooltipAttribute } from '../handleMapHover';

export const getTooltip = ({ info, mapLayers }: { info: PickingInfo<any>; mapLayers: any[] }) => {
	console.log(info);
	if (!info.object || !info.layer) return null;

	const layerId = info.layer.id;
	const mapLayer = Array.isArray(mapLayers) ? mapLayers.find((layer: any) => layer.key === layerId) : undefined;
	const config = mapLayer?.datasource?.configuration;

	console.log('Getting tooltip for layer:', layerId, mapLayer, config);

	const tooltipEnabled = !config?.geojsonOptions?.disableTooltip;
	if (!tooltipEnabled) return null;

	const tooltipSettings = config?.geojsonOptions?.tooltipSettings;
	const featureProperties = info.object?.properties || {};

	let tooltipProperties: TooltipAttribute[] | undefined;

	if (tooltipSettings?.attributes && Array.isArray(tooltipSettings.attributes)) {
		tooltipProperties = tooltipSettings.attributes
			.map((attribute: TooltipAttribute) => {
				let value = featureProperties[attribute.key];
				if (typeof value === 'number' && typeof attribute.decimalPlaces === 'number') {
					value = Number(value.toFixed(attribute.decimalPlaces));
				}
				return {
					key: attribute.key,
					label: attribute.label ?? 'Value',
					value,
					unit: attribute.unit ?? '',
				};
			})
			.filter((attr) => attr.value !== undefined && attr.value !== null);
	}

	if (!tooltipProperties || tooltipProperties.length === 0) {
		return null;
	}

	return {
		html: `
		${tooltipProperties
			.map(
				({ key, label, value, unit }) =>
					`
											<div class="ptr-MapTooltip-row" key="${key}">
												<span class="ptr-MapTooltip-label">${label}:</span>
												<span class="ptr-MapTooltip-value">${String(value)}</span>
												<span class="ptr-MapTooltip-unit">${unit}</span>
											</div>
											`
			)
			.join('')}
            `,
		className: 'ptr-MapTooltip',
		style: {
			backgroundColor: 'var(--base50)',
			padding: '6px 10px',
			borderRadius: '6px',
			boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
		},
	};
};
