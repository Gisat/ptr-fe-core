import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { StoryPhaseType } from '../../enums/enum.story.phaseType';
import { StoryActionType } from '../../enums/enum.story.actionType';
import { StoryPanelLayout } from '../../enums/enum.story.panelLayout';
import { renderActiveSection } from '../../utils/renderActiveSection';
import { StoryMainPanelIntroInternal } from './StoryMainPanelIntro';
import './style.css';

/** Public presentational wrapper for the main panel (apps only). */
export interface StoryMainPanelPublicProps {
	/** Child elements to render inside the main panel */
	children: React.ReactNode;
	/** Optional additional class name for styling */
	className?: string;
}

/**
 * StoryMainPanel Component
 *
 * This component serves as a public wrapper for the main panel in the story layout.
 * It allows for rendering child components and provides internal functionality for managing
 * the active step and animations.
 *
 * @param {StoryMainPanelPublicProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryMainPanel component.
 */
export const StoryMainPanel: React.FC<StoryMainPanelPublicProps> & {
	__PTR_STORY_MAIN_PANEL?: true; // Marker for internal detection
} = ({ children, className }) => <div className={className}>{children}</div>;

// Marker used for internal detection (prevents passing internal props from apps)
StoryMainPanel.__PTR_STORY_MAIN_PANEL = true;

interface StoryMainPanelInternalProps {
	/** Optional class name for styling */
	className?: string;
	/** Child elements to render inside the main panel */
	children: React.ReactNode;
	/** Currently active step index */
	activeStep: number;
	/** Function to update the active step index */
	setActiveStep: (index: number) => void;
	/** Reference to the side panel DOM element */
	sidePanelRef: React.RefObject<HTMLDivElement | null>;
	/** Current layout mode of the panel */
	panelLayout: StoryPanelLayout;
	/** Flag to indicate if there is no side panel */
	noSidePanel: boolean;
	/** Duration of the animation in milliseconds */
	animationDuration?: number;
	/** Pause duration between slides in milliseconds */
	pauseBetweenSlides?: number;
	/** Number of children in the side panel */
	sidePanelChildrenCount: number;
}

/**
 * StoryMainPanelInternal Component
 *
 * This component manages the internal functionality of the main panel, including animations
 * and rendering of active sections based on the current step. It handles transitions between
 * steps and integrates with the side panel.
 *
 * @param {StoryMainPanelInternalProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryMainPanelInternal component.
 */
export const StoryMainPanelInternal: React.FC<StoryMainPanelInternalProps> = ({
	className,
	children,
	activeStep,
	setActiveStep,
	sidePanelRef,
	panelLayout,
	noSidePanel,
	animationDuration = 400,
	pauseBetweenSlides = 0,
	sidePanelChildrenCount,
}) => {
	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<StoryPhaseType>(StoryPhaseType.IDLE);
	const [direction, setDirection] = useState<StoryActionType>(StoryActionType.DOWN);
	const [wrapperStyle, setWrapperStyle] = useState<Record<string, any>>({});

	const panelClasses = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className, {
		'ptr-StoryMainPanel--no-scroll': phase !== StoryPhaseType.IDLE,
	});

	// Effect to handle step changes and set animation direction
	useEffect(() => {
		if (activeStep !== displayedStep && phase === StoryPhaseType.IDLE) {
			setDirection(activeStep > displayedStep ? StoryActionType.DOWN : StoryActionType.UP);
			setPhase(StoryPhaseType.OUT);
			setWrapperStyle({});
		}
	}, [activeStep, displayedStep, phase]);

	// Effect to handle the OUT phase of the animation
	useEffect(() => {
		if (phase === StoryPhaseType.OUT) {
			const horizontalAxis = panelLayout === StoryPanelLayout.SINGLE;
			const transform = horizontalAxis
				? direction === StoryActionType.DOWN
					? 'translateX(-100%)'
					: 'translateX(100%)'
				: direction === StoryActionType.DOWN
					? 'translateY(-100%)'
					: 'translateY(100%)';

			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform,
				opacity: 0,
			});

			const outTimeout = setTimeout(() => {
				const pauseTimeout = setTimeout(() => {
					setPhase(StoryPhaseType.IN);
					const inTransform = horizontalAxis
						? direction === StoryActionType.DOWN
							? 'translateX(100%)'
							: 'translateX(-100%)'
						: direction === StoryActionType.DOWN
							? 'translateY(100%)'
							: 'translateY(-100%)';

					setWrapperStyle({
						transition: 'none',
						transform: inTransform,
						opacity: 0,
					});
					setDisplayedStep(activeStep);
				}, pauseBetweenSlides);
				return () => clearTimeout(pauseTimeout);
			}, animationDuration);

			return () => clearTimeout(outTimeout);
		}
	}, [phase, direction, activeStep, animationDuration, pauseBetweenSlides, panelLayout]);

	// Effect to handle the IN phase of the animation
	useEffect(() => {
		if (phase === StoryPhaseType.IN) {
			const horizontalAxis = panelLayout === StoryPanelLayout.SINGLE;
			const raf = requestAnimationFrame(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: horizontalAxis ? 'translateX(0)' : 'translateY(0)',
					opacity: 1,
				});
			});
			const inTimeout = setTimeout(() => setPhase(StoryPhaseType.IDLE), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(inTimeout);
			};
		}
	}, [phase, animationDuration, panelLayout]);

	// Reset wrapper style when phase is IDLE
	useEffect(() => {
		if (phase === StoryPhaseType.IDLE) setWrapperStyle({});
	}, [phase]);

	// Process children to find and render the intro component
	const processedChildren = React.Children.map(children, (child) => {
		if (React.isValidElement(child) && (child.type as any)?.__PTR_STORY_MAIN_PANEL_INTRO === true) {
			const childElement = child as React.ReactElement<any>;
			return (
				<StoryMainPanelIntroInternal
					className={childElement.props.className}
					backgroundImage={childElement.props.backgroundImage}
					disableCtaButton={childElement.props.disableCtaButton}
					ctaButtonText={childElement.props.ctaButtonText}
					sidePanelRef={sidePanelRef}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					sidePanelChildrenCount={sidePanelChildrenCount}
					isSmallScreen={panelLayout === StoryPanelLayout.SINGLE}
				>
					{childElement.props.children}
				</StoryMainPanelIntroInternal>
			);
		}
		return child;
	});

	return (
		<div className={panelClasses} style={noSidePanel ? { width: '100%' } : {}}>
			<div className="ptr-StoryMainPanel-contentWrapper">
				{renderActiveSection(processedChildren, displayedStep, wrapperStyle, {
					sidePanelRef,
					activeStep,
					isSmallScreen: panelLayout === StoryPanelLayout.SINGLE,
					setActiveStep,
					sidePanelChildrenCount,
				})}
			</div>
		</div>
	);
};
