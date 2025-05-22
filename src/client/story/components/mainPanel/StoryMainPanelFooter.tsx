import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StoryMainPanelFooter component.
 */
interface StoryMainPanelFooterProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to render inside the footer */
	children?: ReactNode;
}

/**
 * StoryMainPanelFooter Component
 *
 * This component represents the footer section of the main panel in a story layout.
 * It is used to display additional information or content at the bottom of the main panel.
 *
 * @param {StoryMainPanelFooterProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryMainPanelFooter component.
 */
export const StoryMainPanelFooter: React.FC<StoryMainPanelFooterProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StoryMainPanelFooter', className);

	return <div className={classes}>{children}</div>;
};
