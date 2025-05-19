import { ReactNode } from 'react';
import classnames from 'classnames';

import './style.css';

/**
 * Props for the StoryMainPanelCase component.
 */
interface StoryMainPanelCaseProps {
	/** Additional class names for styling */
	className?: string;
	/** Child components to render inside the panel case */
	children?: ReactNode;
}

/**
 * StoryMainPanelCase Component
 *
 * This component represents a single case or section within the main panel of a story layout.
 * It is used to encapsulate content and apply consistent styling.
 *
 * @param {StoryMainPanelCaseProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryMainPanelCase component.
 */
export const StoryMainPanelCase: React.FC<StoryMainPanelCaseProps> = ({ className, children }) => {
	const classes = classnames('ptr-StoryMainPanelCase', className);

	return <div className={classes}>{children}</div>;
};
