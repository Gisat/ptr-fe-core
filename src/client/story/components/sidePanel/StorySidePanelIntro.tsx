import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StorySidePanelIntro component.
 */
interface StorySidePanelIntroProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to render inside the side panel intro */
	children?: ReactNode;
}

/**
 * StorySidePanelIntro Component
 *
 * This component represents the introductory section of the side panel in a story layout.
 * It is used to display introductory content or descriptions with consistent styling.
 *
 * @param {StorySidePanelIntroProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StorySidePanelIntro component.
 */
export const StorySidePanelIntro: React.FC<StorySidePanelIntroProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StorySidePanelIntro', className);

	return <div className={classes}>{children}</div>;
};
