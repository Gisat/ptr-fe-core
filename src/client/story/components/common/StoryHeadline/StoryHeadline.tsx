import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StoryHeadline component.
 */
interface StoryHeadlineProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to display inside the headline */
	children?: ReactNode;
}

/**
 * StoryHeadline Component
 *
 * This component represents the main headline of a story. It is used to display
 * prominent text, such as titles or key messages, with consistent styling.
 *
 * @param {StoryHeadlineProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryHeadline component.
 */
export const StoryHeadline: React.FC<StoryHeadlineProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StoryHeadline', className);

	return <h1 className={classes}>{children || null}</h1>;
};
