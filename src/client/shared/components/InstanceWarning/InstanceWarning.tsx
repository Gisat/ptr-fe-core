import React from 'react';
import './InstanceWarning.css';

export interface InstanceWarningProps {
	/**
	 * Text to display inside the warning banner.
	 * If not provided, defaults to "DEV version".
	 */
	text?: string;

	/**
	 * Background color of the warning banner.
	 * Can be any valid CSS color value (e.g., "#D81B1B", "red").
	 * Defaults to "#D81B1B".
	 */
	background?: string;

	/**
	 * Text color of the warning banner.
	 * Can be any valid CSS color value (e.g., "#D81B1B", "red").
	 * Defaults to "#FFFFFF".
	 */
	color?: string;

	/**
	 * If true, the banner will not render.
	 * Defaults to false.
	 */
	hidden?: boolean;
}

/**
 * A stateless warning banner for indicating environment or deployment status.
 *
 * Pure React component with no state or client interactivity.
 * Suitable for static rendering, SSR, and all JavaScript environments.
 */
const InstanceWarning: React.FC<InstanceWarningProps> = ({
	text = 'DEV version',
	background = '#D81B1B',
	color = '#FFFFFF',
	hidden = false,
}) => {
	if (hidden) return null;

	return (
		<div className="ptr-instanceWarning" style={{ background: background, color: color }} role="alert">
			<div className="ptr-instanceWarning-text">{text}</div>
		</div>
	);
};

export { InstanceWarning };
