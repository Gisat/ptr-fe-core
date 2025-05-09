import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StorySidePanelFooter component.
 */
interface StorySidePanelFooterProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to render inside the side panel footer */
	children?: ReactNode;
}

/**
 * StorySidePanelFooter Component
 *
 * This component represents the footer section of the side panel in a story layout.
 * It is used to display additional information or content at the bottom of the side panel.
 *
 * @param {StorySidePanelFooterProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StorySidePanelFooter component.
 */
export const StorySidePanelFooter: React.FC<StorySidePanelFooterProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StorySidePanelFooter', className);

	return <div className={classes}>{children}</div>;
};
