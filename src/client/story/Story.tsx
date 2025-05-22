import classnames from 'classnames';
import { StorySidePanel } from './components/sidePanel/StorySidePanel';
import React, { Children, cloneElement, useCallback, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
//import { storySmallScreenWidth, storySmallScreenHeight } from '@features/story/variables';
import './style.css';
import './variables.css';

/**
 * Props for the Story component.
 */
type StoryProps = {
	/** Callback when the active section changes */
	onStepChange?: (section: number) => void;
	/** Default step to start with */
	defaultStep?: number;
	/** Additional class names for styling */
	className?: string;
	/** Child components */
	children: React.ReactNode;
	storySmallScreenWidth: number;
	storySmallScreenHeight: number;
};

/** Reference to the side panel */
type SidePanelRef = React.RefObject<HTMLDivElement | undefined>;

/**
 * Story Component
 *
 * This component provides a structured layout for presenting information in a narrative format.
 * It dynamically adjusts its layout and content based on the screen size and user interactions.
 *
 * @param {StoryProps} props - The props for the component.
 * @returns {JSX.Element} The rendered Story component.
 */
export const Story: React.FC<StoryProps> = ({ className, children, defaultStep = 0, onStepChange, storySmallScreenWidth, storySmallScreenHeight }) => {
	const [activeStep, setActiveStep] = useState<number>(defaultStep); // Current active section
	const [jumpSection, setJumpSection] = useState<number | null>(null); // Section to jump to
	const [sidePanelRef, setSidePanelRef] = useState<SidePanelRef | undefined>(undefined); // Reference to the side panel
	const [contentSize, setContentSize] = useState<[number, number] | undefined>(undefined); // Size of the content area
	const [panelLayout, setPanelLayout] = useState<string>('horizontal'); // Layout of the panel

	// Generate dynamic class names
	const classes = classnames('ptr-Story', {}, `is-${panelLayout}-layout`, className);

	/**
	 * Handles resizing of the component and updates the layout.
	 * @param {{ width: number | null; height: number | null }} dimensions - The new dimensions of the component.
	 */
	const onResize = useCallback(({ width, height }: { width: number | null; height: number | null }) => {
		if (width !== null && height !== null) {
			setContentSize([width, height]);
			setPanelLayout(width > storySmallScreenWidth || height < storySmallScreenHeight ? 'horizontal' : 'vertical');
		}
	}, []);

	// Hook to detect resizing
	const { ref } = useResizeDetector({
		handleHeight: true,
		onResize,
	});

	/**
	 * Handles scrolling within the side panel and updates the active section.
	 * @param {React.UIEvent<HTMLDivElement>} event - The scroll event.
	 */
	const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
		if (!sidePanelRef?.current) return;

		const sidePanelNodes = Array.from(sidePanelRef.current.childNodes) as HTMLElement[];
		const userReachedBottom =
			sidePanelRef.current.offsetHeight + sidePanelRef.current.scrollTop >= sidePanelRef.current.scrollHeight - 10;

		sidePanelNodes.forEach((node, index) => {
			const userReachedSection =
				node.offsetTop - 100 <= event.currentTarget.scrollTop &&
				node.offsetTop + node.offsetHeight - 100 > event.currentTarget.scrollTop;

			if (userReachedSection) {
				if (jumpSection === null) {
					// User is scrolling
					if (userReachedBottom) {
						setActiveStep(sidePanelNodes.length - 1);
						onStepChange?.(sidePanelNodes.length - 1);
					} else {
						setActiveStep(index);
						onStepChange?.(index);
					}
				} else {
					// User used navigation
					setActiveStep(jumpSection);
					onStepChange?.(jumpSection);
					const userJumpedToBottom = jumpSection === sidePanelNodes.length - 1;
					const userReachedJumpedSection =
						sidePanelNodes[jumpSection].offsetTop > event.currentTarget.scrollTop - 5 &&
						sidePanelNodes[jumpSection].offsetTop < event.currentTarget.scrollTop + 5;

					if (userReachedBottom && userJumpedToBottom) {
						setJumpSection(null);
					} else if (userReachedJumpedSection) {
						setJumpSection(null);
					}
				}
			}
		});
	};

	/**
	 * Determines if the side panel is present.
	 * @returns {boolean} True if the side panel exists, false otherwise.
	 */
	const noSidePanel = !Children.map(children, (child) => {
		return React.isValidElement(child) && child.type === StorySidePanel;
	})?.some((isSidePanel) => isSidePanel === true);

	/**
	 * Renders a child component with additional props.
	 * @param {React.ReactNode} child - The child component to render.
	 * @returns {React.ReactNode | null} The rendered child component or null if invalid.
	 */
	const renderChild = (child: React.ReactNode) => {
		if (React.isValidElement(child)) {
			if (child.type === StorySidePanel) {
				// Handle StorySidePanel children
				return cloneElement(child as React.ReactElement<any>, {
					onScroll,
					setSidePanelRef,
					panelLayout,
					activeStep,
					setJumpSection,
					contentSize,
				});
			} else if (sidePanelRef !== undefined || noSidePanel) {
				// Handle other children when sidePanelRef is defined or noSidePanel is true
				return cloneElement(child as React.ReactElement<any>, {
					activeStep,
					setJumpSection,
					sidePanelRef,
					panelLayout,
					noSidePanel,
				});
			}
		}
		return null; // Return null for invalid elements
	};

	return (
		<div className={classes} ref={ref}>
			{Children.map(children, renderChild)}
		</div>
	);
};
