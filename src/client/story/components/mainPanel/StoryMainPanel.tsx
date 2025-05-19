import React, { ReactNode, cloneElement } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * Props for the StoryMainPanel component.
 */
interface StoryMainPanelProps {
	/** Additional class names for styling */
	className?: string;
	/** Child components to render inside the main panel */
	children?: ReactNode[];
	/** Currently active section */
	activeStep?: number;
	/** Reference to the side panel */
	sidePanelRef?: React.RefObject<HTMLDivElement>;
	/** Layout of the panel (e.g., "vertical" or "horizontal") */
	panelLayout?: string;
	/** Whether the side panel is disabled */
	noSidePanel?: boolean;
}

/**
 * StoryMainPanel Component
 *
 * This component renders the main panel of a story layout. It dynamically adjusts its children
 * based on the active step and the side panel's content.
 *
 * @param {StoryMainPanelProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryMainPanel component.
 */
export const StoryMainPanel: React.FC<StoryMainPanelProps> = ({
	className,
	children = [],
	activeStep = 0,
	sidePanelRef,
	panelLayout = 'horizontal',
	noSidePanel = false,
}) => {
	// Generate dynamic class names
	const classes = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className);

	// Adjust children based on the side panel nodes
	let adjustedChildren = children;
	if (sidePanelRef?.current) {
		const sidePanelNodes = Array.from(sidePanelRef.current.childNodes);
		if (sidePanelNodes.length !== children.length) {
			// If the number of showcases in the main panel is different from the side panel
			adjustedChildren = sidePanelNodes.map((_, index) =>
				children[index] ? children[index] : <div key={index}></div>
			);
		}
	}

	return (
		<div className={classes} style={noSidePanel ? { width: '100%' } : {}}>
			{adjustedChildren[activeStep] ? cloneElement(adjustedChildren[activeStep] as React.ReactElement<any>) : null}
		</div>
	);
};
