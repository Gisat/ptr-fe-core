import React from 'react';
import { TooltipAttribute } from '../handleMapHover';
import './MapTooltip.css';

/**
 * Props for the MapTooltip component.
 * @property {number} x - The x (horizontal) position for the tooltip (in pixels).
 * @property {number} y - The y (vertical) position for the tooltip (in pixels).
 * @property {Array<TooltipAttribute>} tooltipProperties - Array of tooltip attribute objects to display.
 */
export interface MapTooltipProps {
	x: number;
	y: number;
	tooltipProperties: TooltipAttribute[];
}

/**
 * MapTooltip component displays a styled tooltip at a given position with provided properties.
 *
 * @param {MapTooltipProps} props - The props for the tooltip.
 * @returns {JSX.Element} Tooltip element positioned absolutely.
 */
export const MapTooltip: React.FC<MapTooltipProps> = ({ x, y, tooltipProperties }) => (
	<div
		className="ptr-MapTooltip"
		style={{
			left: x,
			top: y,
		}}
	>
		{tooltipProperties.map(({ key, label, value, unit }) => (
			<div key={key} className="ptr-MapTooltip-row">
				<span className="ptr-MapTooltip-label">{label}:</span>{' '}
				<span className="ptr-MapTooltip-value">{String(value)}</span>{' '}
				{unit && <span className="ptr-MapTooltip-unit">{unit}</span>}
			</div>
		))}
		<div className="ptr-MapTooltip-indicator" />
	</div>
);
