import React, { useEffect, useRef } from 'react';
import classnames from 'classnames';
import { StoryNavPanel } from './navPanel/StoryNavPanel';
import './style.css';

/**
 * Props for the StorySidePanel component.
 */
interface StorySidePanelProps {
	/** Additional class names for styling */
	className?: string;
	/** Child components to render inside the side panel */
	children?: React.ReactNode;
	/** Scroll event handler */
	onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
	/** Callback to set the side panel reference */
	setSidePanelRef?: (ref: React.RefObject<HTMLDivElement>) => void;
	/** Layout of the panel (e.g., "horizontal", "vertical") */
	panelLayout?: string;
	/** Currently active section */
	activeStep?: number;
	/** Callback to set the section to jump to */
	setJumpSection?: (section: number) => void;
	/** Size of the content area ([width, height]) */
	contentSize?: [number, number];
	/** Whether to hide the navigation panel */
	hideNavigation?: boolean;
	/** Custom navigation icons for specific sections (e.g., home, footer, etc.) */
	navigationIcons?: {
		home?: React.ReactNode;
		case?: React.ReactNode;
		footer?: React.ReactNode;
	};
}

/**
 * StorySidePanel Component
 *
 * This component represents the side panel of a story layout. It includes navigation functionality
 * and dynamically adjusts its layout and content based on the provided props.
 *
 * @param {StorySidePanelProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StorySidePanel component.
 */
export const StorySidePanel: React.FC<StorySidePanelProps> = ({
	className,
	children,
	onScroll,
	setSidePanelRef,
	panelLayout,
	activeStep = 0,
	setJumpSection,
	contentSize,
	hideNavigation = false,
	navigationIcons,
}) => {
	const sidePanelRef = useRef<HTMLDivElement>(null);

	// Set the side panel reference when the component mounts
	useEffect(() => {
		if (setSidePanelRef && sidePanelRef) {
			setSidePanelRef(sidePanelRef as React.RefObject<HTMLDivElement>);
		}
	}, [setSidePanelRef]);

	// Generate class names dynamically
	const generateClasses = (baseClass: string): string => {
		return classnames(baseClass, { 'hide-navigation': hideNavigation }, `is-${panelLayout}-layout`, className);
	};

	return (
		<div className={generateClasses('ptr-StorySidePanel-container')}>
			{/* Render the navigation panel if navigation is not hidden */}
			{sidePanelRef.current && !hideNavigation ? (
				<StoryNavPanel
					activeStep={activeStep}
					setJumpSection={setJumpSection}
					sidePanelRef={sidePanelRef as React.RefObject<HTMLDivElement>}
					contentSize={contentSize}
					navigationIcons={navigationIcons}
				/>
			) : null}

			{/* Render the side panel */}
			<div className={generateClasses('ptr-StorySidePanel')} ref={sidePanelRef} onScroll={onScroll}>
				{children}
			</div>
		</div>
	);
};
