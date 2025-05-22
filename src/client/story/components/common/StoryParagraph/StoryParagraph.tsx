import React, { ReactNode } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StoryParagraph component.
 */
interface StoryParagraphProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to display inside the paragraph */
	children: ReactNode;
}

/**
 * StoryParagraph Component
 *
 * This component represents a paragraph of text in a story. It is used to display
 * detailed explanations or descriptions with consistent styling.
 *
 * @param {StoryParagraphProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryParagraph component.
 */
export const StoryParagraph: React.FC<StoryParagraphProps> = ({ className, children }) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StoryParagraph', className);

	return <p className={classes}>{children}</p>;
};
