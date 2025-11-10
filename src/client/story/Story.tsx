import classnames from 'classnames';
import React, { Children, cloneElement, useCallback, useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { StorySidePanel } from './components/sidePanel/StorySidePanel';
import { StoryNavPanel } from './components/sidePanel/navPanel/StoryNavPanel';
import { StoryPanelLayout } from './enums/enum.story.panelLayout';
import { StoryPanelType } from './enums/enum.story.panelType';
import {
	DEFAULT_STORY_SMALL_SCREEN_WIDTH,
	DEFAULT_STORY_SMALL_SCREEN_HEIGHT,
	DEFAULT_STORY_MEDIUM_SCREEN_WIDTH,
	DEFAULT_STORY_MEDIUM_SCREEN_HEIGHT,
} from './constants/defaults';
import { computeStoryPanelLayout } from './utils/computeStoryPanelLayout';
import { handleSidePanelScroll } from './utils/handleSidePanelScroll';
import { useStorySwipe } from './utils/useStorySwipe';
import { StoryPanelToggle } from './components/toggle/StoryPanelToggle';
import './style.css';
import './variables.css';

/**
 * Props for Story component.
 */
type StoryProps = {
	onStepChange?: (sectionIndex: number) => void;
	defaultStep?: number;
	className?: string;
	children: React.ReactNode;
	storySmallScreenWidth?: number;
	storySmallScreenHeight?: number;
	storyMediumScreenWidth?: number;
	storyMediumScreenHeight?: number;
	navigationIcons?: any;
	fullNavigation?: boolean;
	hideNavigation?: boolean;
};

type SidePanelDomRef = React.RefObject<HTMLDivElement>;

/**
 * Story component orchestrates responsive panel layout and section navigation.
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
}) => {
	const [activeSectionIndex, setActiveSectionIndex] = useState<number>(defaultStep);
	const [jumpTargetSectionIndex, setJumpTargetSectionIndex] = useState<number | null>(null);
	const [sidePanelDomRef, setSidePanelDomRef] = useState<SidePanelDomRef | undefined>(undefined);
	const [sidePanelSectionCount, setSidePanelSectionCount] = useState<number>(0);
	const [contentSizeDimensions, setContentSizeDimensions] = useState<[number, number] | undefined>(undefined);
	const [panelLayoutMode, setPanelLayoutMode] = useState<StoryPanelLayout>(StoryPanelLayout.HORIZONTAL);
	const [visiblePanelType, setVisiblePanelType] = useState<StoryPanelType>(StoryPanelType.MAIN);

	const getMaxSectionIndex = () => (sidePanelSectionCount > 0 ? sidePanelSectionCount - 1 : 0);

	// Swipe
	const { handleTouchStart, handleTouchMove, handleTouchEnd } = useStorySwipe(
		setActiveSectionIndex,
		getMaxSectionIndex
	);

	// Resize
	const onResize = useCallback(
		({ width, height }: { width: number | null; height: number | null }) => {
			if (width === null || height === null) return;
			setContentSizeDimensions([width, height]);
			const layout = computeStoryPanelLayout(
				width,
				height,
				storySmallScreenWidth,
				storySmallScreenHeight,
				storyMediumScreenWidth,
				storyMediumScreenHeight
			);
			setPanelLayoutMode(layout);
		},
		[storySmallScreenWidth, storySmallScreenHeight, storyMediumScreenWidth, storyMediumScreenHeight]
	);

	const { ref } = useResizeDetector({
		handleHeight: true,
		onResize,
	});

	// External callback
	useEffect(() => {
		onStepChange?.(activeSectionIndex);
	}, [activeSectionIndex, onStepChange]);

	// Presence of side panel
	const hasSidePanel = Children.toArray(children).some(
		(child) => React.isValidElement(child) && child.type === StorySidePanel
	);
	const noSidePanel = !hasSidePanel;

	/**
	 * Clone and render a child with explicit props.
	 */
	function renderStoryChildElement(child: React.ReactNode) {
		if (!React.isValidElement(child)) return null;
		const isSidePanel = child.type === StorySidePanel;

		if (isSidePanel) {
			return cloneElement(child as React.ReactElement<any>, {
				onScroll: (e: React.UIEvent<HTMLDivElement>) =>
					handleSidePanelScroll(
						e,
						sidePanelDomRef,
						panelLayoutMode,
						jumpTargetSectionIndex,
						setActiveSectionIndex,
						setJumpTargetSectionIndex,
						onStepChange
					),
				setSidePanelRef: setSidePanelDomRef,
				setSidePanelChildrenCount: setSidePanelSectionCount,
				sidePanelChildrenCount: sidePanelSectionCount,
				panelLayout: panelLayoutMode,
				activeStep: activeSectionIndex,
				setActiveStep: setActiveSectionIndex,
				setJumpSection: setJumpTargetSectionIndex,
				contentSize: contentSizeDimensions,
				visiblePanel: visiblePanelType,
				fullNavigation,
				navigationIcons,
				hideNavigation,
			});
		}

		if (sidePanelDomRef !== undefined || noSidePanel) {
			if (panelLayoutMode !== StoryPanelLayout.SINGLE || visiblePanelType === StoryPanelType.MAIN) {
				return cloneElement(child as React.ReactElement<any>, {
					activeStep: activeSectionIndex,
					setActiveStep: setActiveSectionIndex,
					setJumpSection: setJumpTargetSectionIndex,
					sidePanelRef: sidePanelDomRef,
					panelLayout: panelLayoutMode,
					noSidePanel,
					sidePanelChildrenCount: sidePanelSectionCount,
				});
			}
		}
		return null;
	}

	const rootClassNames = classnames(
		'ptr-Story',
		`is-${panelLayoutMode}-layout`,
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
			{Children.map(children, renderStoryChildElement)}

			<div className={classnames('ptr-StoryPanelWrapper', `is-${panelLayoutMode}-layout`)}>
				{panelLayoutMode === StoryPanelLayout.SINGLE && (
					<StoryPanelToggle value={visiblePanelType} onChange={(val) => setVisiblePanelType(val)} />
				)}

				{panelLayoutMode === StoryPanelLayout.SINGLE && sidePanelDomRef?.current && !hideNavigation && (
					<StoryNavPanel
						activeStep={activeSectionIndex}
						setActiveStep={setActiveSectionIndex}
						setJumpSection={setJumpTargetSectionIndex}
						sidePanelRef={sidePanelDomRef as React.RefObject<HTMLDivElement>}
						sidePanelChildrenCount={sidePanelSectionCount}
						contentSize={contentSizeDimensions}
						navigationIcons={navigationIcons}
						fullNavigation={fullNavigation}
						panelLayout={panelLayoutMode}
					/>
				)}
			</div>
		</div>
	);
};
