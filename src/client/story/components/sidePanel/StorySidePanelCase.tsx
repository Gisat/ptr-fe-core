import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StorySidePanelCase component.
 */
interface StorySidePanelCaseProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to render inside the side panel case */
	children?: ReactNode;
}

/**
 * StorySidePanelCase Component
 *
 * This component represents a single case or section within the side panel of a story layout.
 * It is used to encapsulate content and apply consistent styling.
 *
 * @param {StorySidePanelCaseProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StorySidePanelCase component.
 */
export const StorySidePanelCase: React.FC<StorySidePanelCaseProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StorySidePanelCase', className);

	return <div className={classes}>{children}</div>;
};
