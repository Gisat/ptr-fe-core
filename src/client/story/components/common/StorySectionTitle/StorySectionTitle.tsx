import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StorySubheadline component.
 */
interface StorySubheadlineProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to display inside the subheadline */
	children: ReactNode;
}

/**
 * StorySectionTitle Component
 *
 * This component represents a section title in a story. It is used to display
 * section titles or key messages with consistent styling.
 *
 * @param {StorySubheadlineProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StorySectionTitle component.
 */
export const StorySectionTitle: React.FC<StorySubheadlineProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StorySectionTitle', className);

	return <h3 className={classes}>{children}</h3>;
};
