import classnames from 'classnames';
import React, { Children, useCallback, useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { StorySidePanel, StorySidePanelInternal } from './components/sidePanel/StorySidePanel';
import { StoryNavPanel } from './components/sidePanel/navPanel/StoryNavPanel';
import { StoryPanelLayout } from './enums/enum.story.panelLayout';
import { StoryPanelType } from './enums/enum.story.panelType';
import {
	DEFAULT_STORY_SMALL_SCREEN_WIDTH,
	DEFAULT_STORY_SMALL_SCREEN_HEIGHT,
	DEFAULT_STORY_MEDIUM_SCREEN_WIDTH,
	DEFAULT_STORY_MEDIUM_SCREEN_HEIGHT,
} from './constants/defaults';
import { computePanelLayout } from './utils/computePanelLayout';
import { handleSidePanelScroll } from './utils/handleSidePanelScroll';
import { useStorySwipe } from './utils/useStorySwipe';
import { StoryPanelToggle } from './components/toggle/StoryPanelToggle';
import { StoryMainPanelInternal } from './components/mainPanel/StoryMainPanel';
import './variables.css';
import './Story.css';

/**
 * Props for Story component.
 */
type StoryProps = {
	/** Custom class name for root element */
	className?: string;
	/** Story children (main panel, side panel, etc.) */
	children: React.ReactNode;
	/** Callback fired when active section changes */
	onStepChange?: (sectionIndex: number) => void;
	/** Initial active section index */
	defaultStep?: number;
	/** Responsive breakpoints for small screens */
	storySmallScreenWidth?: number;
	storySmallScreenHeight?: number;
	/** Responsive breakpoints for medium screens */
	storyMediumScreenWidth?: number;
	storyMediumScreenHeight?: number;
	/** Custom navigation icons */
	navigationIcons?: {
		home?: React.ReactNode;
		case?: React.ReactNode;
		footer?: React.ReactNode;
	};
	/** Show full navigation panel */
	fullNavigation?: boolean;
	/** Hide navigation panel */
	hideNavigation?: boolean;
	/** Duration of the animation in milliseconds */
	animationDuration?: number;
	/** Pause duration between slides in milliseconds */
	pauseBetweenSlides?: number;
};

/**
 * Story component orchestrates responsive panel layout and section navigation.
 * It wraps main/side panels, manages layout, swipe, and navigation logic.
 */
export const Story: React.FC<StoryProps> = ({
	className,
	children,
	defaultStep = 0,
	onStepChange,
	storySmallScreenWidth = DEFAULT_STORY_SMALL_SCREEN_WIDTH,
	storySmallScreenHeight = DEFAULT_STORY_SMALL_SCREEN_HEIGHT,
	storyMediumScreenWidth = DEFAULT_STORY_MEDIUM_SCREEN_WIDTH,
	storyMediumScreenHeight = DEFAULT_STORY_MEDIUM_SCREEN_HEIGHT,
	navigationIcons,
	fullNavigation = true,
	hideNavigation = false,
	animationDuration = 400,
	pauseBetweenSlides = 0,
}) => {
	/** Currently active section index */
	const [activeStep, setActiveStep] = useState<number>(defaultStep);
	/** Section index to jump to (for scroll sync) */
	const [jumpSection, setJumpSection] = useState<number | null>(null);
	/** Number of children in side panel */
	const [sidePanelChildrenCount, setSidePanelChildrenCount] = useState<number>(0);
	/** Content area size ([width, height]) */
	const [contentSize, setContentSize] = useState<[number, number] | undefined>(undefined);
	/** Current layout mode (responsive) */
	const [panelLayout, setPanelLayout] = useState<StoryPanelLayout>(StoryPanelLayout.HORIZONTAL);
	/** Which panel is visible in single layout */
	const [visiblePanelType, setVisiblePanelType] = useState<StoryPanelType>(StoryPanelType.MAIN);

	/** Returns the max valid section index for navigation */
	const getMaxSectionIndex = () => (sidePanelChildrenCount > 0 ? sidePanelChildrenCount - 1 : 0);

	// Swipe navigation handlers
	const { handleTouchStart, handleTouchMove, handleTouchEnd } = useStorySwipe(setActiveStep, getMaxSectionIndex);

	/** Ref to the side panel DOM node */
	const sidePanelRef = React.useRef<HTMLDivElement | null>(null);

	/**
	 * Handles resize events to update layout and content size.
	 */
	const onResize = useCallback(
		({ width, height }: { width: number | null; height: number | null }) => {
			if (width === null || height === null) return;
			setContentSize([width, height]);
			const layout = computePanelLayout(
				width,
				height,
				storySmallScreenWidth,
				storySmallScreenHeight,
				storyMediumScreenWidth,
				storyMediumScreenHeight
			);
			setPanelLayout(layout);
		},
		[storySmallScreenWidth, storySmallScreenHeight, storyMediumScreenWidth, storyMediumScreenHeight]
	);

	// Attach resize detector to root
	const { ref } = useResizeDetector({
		handleHeight: true,
		onResize,
	});

	// Fire external callback on step change
	useEffect(() => {
		onStepChange?.(activeStep);
	}, [activeStep, onStepChange]);

	// Detect if side panel is present
	const hasSidePanel = Children.toArray(children).some(
		(child) => React.isValidElement(child) && child.type === StorySidePanel
	);
	const noSidePanel = !hasSidePanel;

	/**
	 * Renders each child, replacing public wrappers with internal logic components.
	 */
	function renderStoryChildElement(child: React.ReactNode) {
		if (!React.isValidElement(child)) return null;

		const isPublicSidePanel = (child.type as any)?.__PTR_STORY_SIDE_PANEL === true;
		const isPublicMainPanel = (child.type as any)?.__PTR_STORY_MAIN_PANEL === true;

		const childElement = child as React.ReactElement<any>;

		// Replace public side panel wrapper with internal logic
		if (isPublicSidePanel) {
			return (
				<StorySidePanelInternal
					onScroll={(e: React.UIEvent<HTMLDivElement>) =>
						handleSidePanelScroll(
							e,
							sidePanelRef,
							panelLayout,
							jumpSection,
							setActiveStep,
							setJumpSection,
							onStepChange
						)
					}
					sidePanelRef={sidePanelRef}
					setSidePanelChildrenCount={setSidePanelChildrenCount}
					sidePanelChildrenCount={sidePanelChildrenCount}
					panelLayout={panelLayout}
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setJumpSection={setJumpSection}
					contentSize={contentSize}
					visiblePanelType={visiblePanelType}
					fullNavigation={fullNavigation}
					navigationIcons={navigationIcons}
					hideNavigation={hideNavigation}
					className={childElement.props.className}
					animationDuration={animationDuration}
					pauseBetweenSlides={pauseBetweenSlides}
				>
					{childElement.props.children}
				</StorySidePanelInternal>
			);
		}

		// Replace public main panel wrapper with internal logic
		if (isPublicMainPanel) {
			if (panelLayout !== StoryPanelLayout.SINGLE || visiblePanelType === StoryPanelType.MAIN) {
				return (
					<StoryMainPanelInternal
						className={childElement.props.className}
						activeStep={activeStep}
						setActiveStep={setActiveStep}
						sidePanelRef={sidePanelRef}
						panelLayout={panelLayout}
						noSidePanel={noSidePanel}
						sidePanelChildrenCount={sidePanelChildrenCount}
						animationDuration={animationDuration}
						pauseBetweenSlides={pauseBetweenSlides}
					>
						{childElement.props.children}
					</StoryMainPanelInternal>
				);
			}
			return null;
		}

		// Fallback: warn if child is not wrapped properly
		console.warn('Story: Children should be wrapped inside StoryMainPanel or StorySidePanel.');
		return childElement;
	}

	const rootClassNames = classnames(
		'ptr-Story',
		`is-${panelLayout}-layout`,
		`is-${visiblePanelType}-visible`,
		className
	);

	return (
		<div
			className={rootClassNames}
			ref={ref}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			{/* Render main/side panels and other children */}
			{Children.map(children, renderStoryChildElement)}

			{/* Panel navigation and toggle for single layout */}
			<div className={classnames('ptr-StoryPanelWrapper', `is-${panelLayout}-layout`)}>
				{panelLayout === StoryPanelLayout.SINGLE && (
					<StoryPanelToggle value={visiblePanelType} onChange={(val) => setVisiblePanelType(val)} />
				)}

				{panelLayout === StoryPanelLayout.SINGLE && sidePanelRef.current && !hideNavigation && (
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
			</div>
		</div>
	);
};
