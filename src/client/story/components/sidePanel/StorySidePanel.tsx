import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { renderActiveSection } from '../../utils/renderActiveSection';
import { StoryNavPanel } from './navPanel/StoryNavPanel';
import { StoryPhaseType } from '../../enums/enum.story.phaseType';
import { StoryPanelLayout } from '../../enums/enum.story.panelLayout';
import { StoryPanelDirection } from '../../enums/enum.story.sidePanelDirection';
import { StoryPanelType } from '../../enums/enum.story.panelType';
import './style.css';

/**
 * Public props for the StorySidePanel component.
 */
export interface StorySidePanelPublicProps {
	/** Child elements to render inside the side panel */
	children: React.ReactNode;
	/** Optional additional class name for styling */
	className?: string;
}

/**
 * StorySidePanel component for rendering side panel content.
 * This is a public wrapper that can be used in the story.
 */
export const StorySidePanel: React.FC<StorySidePanelPublicProps> & {
	__PTR_STORY_SIDE_PANEL?: true; // Marker for internal detection
} = ({ children }) => <>{children}</>;

// Marker used for internal detection (prevents passing internal props from apps)
StorySidePanel.__PTR_STORY_SIDE_PANEL = true;

interface StorySidePanelInternalProps {
	/** Optional class name for styling */
	className?: string;
	/** Child elements to render inside the side panel */
	children: React.ReactNode;
	/** Scroll event handler */
	onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
	/** Reference to the side panel DOM element */
	sidePanelRef: React.RefObject<HTMLDivElement | null>;
	/** Function to set the number of children in the side panel */
	setSidePanelChildrenCount: (cnt: number) => void;
	/** Current layout mode of the panel */
	panelLayout: StoryPanelLayout;
	/** Currently active step index */
	activeStep: number;
	/** Function to update the active step index */
	setActiveStep: (n: number) => void;
	/** Function to set the jump target section index */
	setJumpSection: (n: number | null) => void;
	/** Optional size of the content area */
	contentSize?: [number, number];
	/** Type of the visible panel */
	visiblePanelType: StoryPanelType;
	/** Flag to hide navigation */
	hideNavigation?: boolean;
	/** Flag to show full navigation */
	fullNavigation?: boolean;
	/** Custom navigation icons */
	navigationIcons?: {
		home?: React.ReactNode;
		case?: React.ReactNode;
		footer?: React.ReactNode;
	};
	/** Number of children in the side panel */
	sidePanelChildrenCount: number;
	/** Duration of the animation in milliseconds */
	animationDuration?: number;
	/** Pause duration between slides in milliseconds */
	pauseBetweenSlides?: number;
}

/**
 * Internal component for rendering the side panel with animations and navigation.
 */
export const StorySidePanelInternal: React.FC<StorySidePanelInternalProps> = ({
	className,
	children,
	onScroll,
	sidePanelRef,
	setSidePanelChildrenCount,
	panelLayout,
	activeStep,
	setActiveStep,
	setJumpSection,
	contentSize,
	visiblePanelType,
	hideNavigation,
	fullNavigation,
	navigationIcons,
	sidePanelChildrenCount,
	animationDuration = 400,
	pauseBetweenSlides = 0,
}) => {
	const [displayedStep, setDisplayedStep] = useState(activeStep); // Currently displayed step
	const [phase, setPhase] = useState<StoryPhaseType>(StoryPhaseType.IDLE); // Current animation phase
	const [direction, setDirection] = useState<StoryPanelDirection>(StoryPanelDirection.RIGHT); // Direction of the animation
	const [wrapperStyle, setWrapperStyle] = useState<React.CSSProperties>({}); // Styles for the wrapper

	useEffect(() => {
		setSidePanelChildrenCount(React.Children.count(children)); // Update the number of children in the side panel
	}, [children, setSidePanelChildrenCount]);

	// Generate class names based on the current layout and visibility
	const generateClasses = (base: string) =>
		classnames(base, `is-${panelLayout}-layout`, `is-${visiblePanelType}-visible`, className);

	// OUT trigger effect
	useEffect(() => {
		if (panelLayout === StoryPanelLayout.SINGLE && activeStep !== displayedStep && phase === StoryPhaseType.IDLE) {
			setDirection(activeStep > displayedStep ? StoryPanelDirection.RIGHT : StoryPanelDirection.LEFT);
			setPhase(StoryPhaseType.OUT);
			setWrapperStyle({});
		}
	}, [panelLayout, activeStep, displayedStep, phase]);

	// OUT phase effect
	useEffect(() => {
		if (panelLayout === StoryPanelLayout.SINGLE && phase === StoryPhaseType.OUT) {
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(.4,0,.2,1), opacity ${animationDuration}ms cubic-bezier(.4,0,.2,1)`,
				transform: direction === StoryPanelDirection.RIGHT ? 'translateX(-100%)' : 'translateX(100%)',
				opacity: 0,
			});
			const outT = setTimeout(() => {
				const pauseT = setTimeout(() => {
					setPhase(StoryPhaseType.IN);
					setWrapperStyle({
						transition: 'none',
						transform: direction === StoryPanelDirection.RIGHT ? 'translateX(100%)' : 'translateX(-100%)',
						opacity: 0,
					});
					setDisplayedStep(activeStep);
				}, pauseBetweenSlides);
				return () => clearTimeout(pauseT);
			}, animationDuration);
			return () => clearTimeout(outT);
		}
	}, [panelLayout, phase, direction, activeStep, animationDuration, pauseBetweenSlides]);

	// IN phase effect
	useEffect(() => {
		if (panelLayout === StoryPanelLayout.SINGLE && phase === StoryPhaseType.IN) {
			const raf = requestAnimationFrame(() =>
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(.4,0,.2,1), opacity ${animationDuration}ms cubic-bezier(.4,0,.2,1)`,
					transform: 'translateX(0)',
					opacity: 1,
				})
			);
			const t = setTimeout(() => setPhase(StoryPhaseType.IDLE), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(t);
			};
		}
	}, [panelLayout, phase, animationDuration]);

	// Reset wrapper style when phase is IDLE
	useEffect(() => {
		if (phase === StoryPhaseType.IDLE) setWrapperStyle({});
	}, [phase]);

	// Render the body based on the panel layout
	const body =
		panelLayout === StoryPanelLayout.SINGLE
			? renderActiveSection(children, displayedStep, wrapperStyle, { activeStep: displayedStep })
			: children;

	return visiblePanelType === StoryPanelType.SIDE || panelLayout !== StoryPanelLayout.SINGLE ? (
		<div className={generateClasses('ptr-StorySidePanel-container')}>
			{panelLayout !== StoryPanelLayout.SINGLE &&
				!hideNavigation &&
				sidePanelRef.current &&
				sidePanelChildrenCount > 0 && (
					<StoryNavPanel
						activeStep={activeStep}
						setActiveStep={setActiveStep}
						setJumpSection={setJumpSection}
						sidePanelRef={sidePanelRef}
						sidePanelChildrenCount={sidePanelChildrenCount}
						contentSize={contentSize}
						navigationIcons={navigationIcons}
						fullNavigation={fullNavigation}
						panelLayout={panelLayout}
					/>
				)}
			<div className={generateClasses('ptr-StorySidePanel')} ref={sidePanelRef} onScroll={onScroll}>
				{body}
			</div>
		</div>
	) : null;
};
