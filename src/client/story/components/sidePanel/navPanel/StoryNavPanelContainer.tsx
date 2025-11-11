import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import {
	IconChevronDown,
	IconChevronUp,
	IconCircleFilled,
	IconHomeFilled,
	IconSquareFilled,
} from '@tabler/icons-react';
import { handleSectionScroll } from './logic/handleSectionScroll';
import { handleScrollUp } from './logic/handleScrollUp';
import { handleScrollDown } from './logic/handleScrollDown';
import { handleHomeNavigation } from './logic/handleHomeNavigation';
import { handleFooterNavigation } from './logic/handleFooterNavigation';
import { handleCaseNavigation } from './logic/handleCaseNavigation';
import { StoryActionType } from '../../../enums/enum.story.actionType';
import './style.css';

/**
 * Props for the StoryNavPanelContainer component.
 */
interface StoryNavPanelContainerProps {
	/** Additional class names for styling */
	className?: string;
	/** The currently active step in the navigation */
	activeStep: number;
	/** Callback to set the active step */
	setActiveStep: (step: number) => void;
	/** Callback to set the section to jump to */
	setJumpSection: (section: number) => void;
	/** Reference to the side panel */
	sidePanelRef: React.RefObject<HTMLDivElement | null>;
	/** Number of children (sections) in the side panel */
	sidePanelChildrenCount: number;
	/** Size of the content area ([width, height]) */
	contentSize?: [number, number];
	/** Custom navigation icons */
	navigationIcons?: {
		/** Icon for the home section */
		home?: React.ReactNode;
		/** Icon for the case section */
		case?: React.ReactNode;
		/** Icon for the footer section */
		footer?: React.ReactNode;
	};
	/** Whether to show full navigation */
	fullNavigation?: boolean;
	/** Whether the layout is small screen (single panel) */
	isSmallScreen?: boolean;
}

/**
 * StoryNavPanelContainer Component
 *
 * This component represents the container for the navigation panel in the side panel of a story layout.
 * It provides navigation functionality, such as scrolling between sections, and supports customizable
 * layouts, themes, and icons.
 *
 * @param {StoryNavPanelContainerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryNavPanelContainer component.
 */
export const StoryNavPanelContainer: React.FC<StoryNavPanelContainerProps> = ({
	className,
	activeStep,
	setActiveStep,
	setJumpSection,
	sidePanelRef,
	sidePanelChildrenCount,
	contentSize,
	navigationIcons,
	fullNavigation = true,
	isSmallScreen,
}) => {
	const [isOverflown, setIsOverflown] = useState(false);
	const [lastSidePanelHeight, setLastSidePanelHeight] = useState<number | undefined>();
	const navPanelCasesRef = useRef<HTMLDivElement>(null);
	const navPanel = useRef<HTMLDivElement>(null);

	/**
	 * Generates dynamic class names based on the base name.
	 * @param {string[]} names - The base class names.
	 * @returns {string} The generated class name.
	 */
	const classes = (names: string[]) => classnames(...names, className);

	/**
	 * Updates the overflow state of the navigation panel based on the side panel's height.
	 */
	useEffect(() => {
		if (!isSmallScreen && sidePanelRef?.current && navPanel.current) {
			const sidePanelHeight = sidePanelRef.current.offsetHeight;
			const navPanelHeight = navPanel.current.offsetHeight;

			if (sidePanelHeight !== lastSidePanelHeight) {
				setIsOverflown(navPanelHeight > sidePanelHeight);
				setLastSidePanelHeight(sidePanelHeight);
			}
		}
	}, [sidePanelRef, contentSize, lastSidePanelHeight, isSmallScreen]);

	/**
	 * Handles scrolling to a specific section or navigating up/down.
	 * @param {React.MouseEvent} e - The mouse event.
	 * @param {StoryActionType} type - The type of navigation action.
	 */
	const scrollToSection = (e: React.MouseEvent, type: StoryActionType) => {
		if (!sidePanelRef?.current || !navPanelCasesRef.current) return;

		const sidePanelNodes = Array.from(sidePanelRef.current.childNodes) as HTMLElement[];
		const navPanelCasesNodes = Array.from(navPanelCasesRef.current.childNodes) as HTMLElement[];

		switch (type) {
			case StoryActionType.SECTION:
				handleSectionScroll(
					e,
					sidePanelNodes,
					navPanelCasesNodes,
					activeStep,
					sidePanelRef,
					setJumpSection,
					isSmallScreen,
					setActiveStep
				);
				break;
			case StoryActionType.UP:
				handleScrollUp(sidePanelNodes, activeStep, sidePanelRef, isSmallScreen, setActiveStep);
				break;
			case StoryActionType.DOWN:
				handleScrollDown(
					sidePanelNodes,
					activeStep,
					sidePanelRef,
					sidePanelChildrenCount,
					isSmallScreen,
					setActiveStep
				);
				break;
			default:
				break;
		}
	};

	/**
	 * Generates the appropriate navigation icon for a given index.
	 * @param {number} index - The index of the navigation step.
	 * @returns {JSX.Element} The navigation icon.
	 */
	const getSectionNavigationIcons = (index: number) => {
		const navigationStep = {
			home: 0,
			footer: sidePanelChildrenCount ? sidePanelChildrenCount - 1 : 0,
		};
		switch (index) {
			case navigationStep.home:
				return handleHomeNavigation(
					index,
					activeStep,
					(e) => scrollToSection(e, StoryActionType.SECTION),
					classes,
					<IconHomeFilled />,
					navigationIcons?.home
				);
			case navigationStep.footer:
				return handleFooterNavigation(
					index,
					activeStep,
					(e) => scrollToSection(e, StoryActionType.SECTION),
					classes,
					<IconSquareFilled />,
					navigationIcons?.footer
				);
			default:
				return handleCaseNavigation(
					index,
					activeStep,
					(e) => scrollToSection(e, StoryActionType.SECTION),
					classes,
					<IconCircleFilled />,
					navigationIcons?.case
				);
		}
	};

	/**
	 * Retrieves all child nodes of the side panel and generates navigation icons for each section.
	 */
	const sectionNavigationIcons = Array.from({ length: sidePanelChildrenCount ?? 0 }).map((_, index) =>
		getSectionNavigationIcons(index)
	);

	return (
		<div className={classes(['ptr-StoryNavPanelContainer'])} ref={navPanel}>
			<IconChevronUp
				className={classes(['ptr-StoryNavPanelIcon', 'arrow-up'])}
				onClick={(e) => scrollToSection(e, StoryActionType.UP)}
			/>
			{fullNavigation && (
				<div
					className="ptr-StoryNavPanelCases"
					ref={navPanelCasesRef}
					style={
						isOverflown && !isSmallScreen
							? { height: '0rem', overflow: 'hidden' }
							: { height: 'fit-content', overflow: 'visible' }
					}
				>
					{sectionNavigationIcons}
				</div>
			)}
			<IconChevronDown
				className={classes(['ptr-StoryNavPanelIcon', 'arrow-down'])}
				onClick={(e) => scrollToSection(e, StoryActionType.DOWN)}
			/>
		</div>
	);
};
