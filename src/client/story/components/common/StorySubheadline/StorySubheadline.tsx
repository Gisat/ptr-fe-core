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
 * StorySubheadline Component
 *
 * This component represents a subheadline in a story. It is used to display
 * secondary titles or key messages with consistent styling.
 *
 * @param {StorySubheadlineProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StorySubheadline component.
 */
export const StorySubheadline: React.FC<StorySubheadlineProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StorySubheadline', className);

	return <h2 className={classes}>{children}</h2>;
};
