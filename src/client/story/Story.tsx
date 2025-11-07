import classnames from 'classnames';
import { StorySidePanel } from './components/sidePanel/StorySidePanel';
import React, { Children, cloneElement, useCallback, useRef, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import './style.css';
import './variables.css';
import { IconMap, IconTextCaption } from '@tabler/icons-react';
import { SegmentedControl } from '@mantine/core';

/**
 * Props for the Story component.
 */
type StoryProps = {
	onStepChange?: (section: number) => void;
	defaultStep?: number;
	className?: string;
	children: React.ReactNode;
	storySmallScreenWidth: number;
	storySmallScreenHeight: number;
};

type SidePanelRef = React.RefObject<HTMLDivElement | undefined>;

export const Story: React.FC<StoryProps> = ({
	className,
	children,
	defaultStep = 0,
	onStepChange,
	storySmallScreenWidth,
	storySmallScreenHeight,
}) => {
	const [activeStep, setActiveStep] = useState<number>(defaultStep);
	const [jumpSection, setJumpSection] = useState<number | null>(null);
	const [sidePanelRef, setSidePanelRef] = useState<SidePanelRef | undefined>(undefined);
	const [contentSize, setContentSize] = useState<[number, number] | undefined>(undefined);
	const [panelLayout, setPanelLayout] = useState<string>('horizontal');
	const [visiblePanel, setVisiblePanel] = useState<'main' | 'side'>('main');
	const [isSmallScreen, setIsSmallScreen] = useState(false);

	const classes = classnames('ptr-Story', {}, `is-${panelLayout}-layout`, `is-${visiblePanel}-visible`, className);

	const touchStartX = useRef<number | null>(null);
	const touchEndX = useRef<number | null>(null);
	const touchStartTime = useRef<number | null>(null);
	const touchEndTime = useRef<number | null>(null);

	// Helper to get max step for current panel
	const getMaxStep = () => {
		return sidePanelRef.current.childNodes.length - 1;
	};

	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		touchStartX.current = e.touches[0].clientX;
		touchStartTime.current = Date.now();
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		touchEndX.current = e.touches[0].clientX;
	};

	const handleTouchEnd = () => {
		touchEndTime.current = Date.now();
		if (
			touchStartX.current !== null &&
			touchEndX.current !== null &&
			touchStartTime.current !== null &&
			touchEndTime.current !== null
		) {
			const deltaX = touchEndX.current - touchStartX.current;
			const deltaTime = touchEndTime.current - touchStartTime.current; // ms
			const velocity = Math.abs(deltaX) / deltaTime; // px/ms

			const minDistance = 200; // px
			const minVelocity = 0.5; // px/ms (tweak as needed)

			console.log('Swipe detected:', { deltaX, deltaTime, velocity });

			if (Math.abs(deltaX) > minDistance && velocity > minVelocity) {
				// Fast enough swipe!
				if (deltaX < 0) {
					// Swipe left: next step
					setActiveStep((prev) => Math.min(prev + 1, getMaxStep()));
				} else {
					// Swipe right: previous step
					setActiveStep((prev) => Math.max(prev - 1, 0));
				}
			}
		}
		touchStartX.current = null;
		touchEndX.current = null;
		touchStartTime.current = null;
		touchEndTime.current = null;
	};

	const onResize = useCallback(({ width, height }: { width: number | null; height: number | null }) => {
		if (width !== null && height !== null) {
			setContentSize([width, height]);
			const small = width <= storySmallScreenWidth || height < storySmallScreenHeight;
			setPanelLayout(small ? 'vertical' : 'horizontal');
			setIsSmallScreen(small);
		}
	}, []);
	const { ref } = useResizeDetector({
		handleHeight: true,
		onResize,
	});

	const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
		if (!sidePanelRef?.current || isSmallScreen) return;

		const sidePanelNodes = Array.from(sidePanelRef.current.childNodes) as HTMLElement[];
		const userReachedBottom =
			sidePanelRef.current.offsetHeight + sidePanelRef.current.scrollTop >= sidePanelRef.current.scrollHeight - 10;

		sidePanelNodes.forEach((node, index) => {
			const userReachedSection =
				node.offsetTop - 100 <= event.currentTarget.scrollTop &&
				node.offsetTop + node.offsetHeight - 100 > event.currentTarget.scrollTop;

			if (userReachedSection) {
				if (jumpSection === null) {
					if (userReachedBottom) {
						setActiveStep(sidePanelNodes.length - 1);
						onStepChange?.(sidePanelNodes.length - 1);
					} else {
						setActiveStep(index);
						onStepChange?.(index);
					}
				} else {
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

	const noSidePanel = !Children.map(children, (child) => {
		return React.isValidElement(child) && child.type === StorySidePanel;
	})?.some((isSidePanel) => isSidePanel === true);

	const renderChild = (child: React.ReactNode) => {
		if (React.isValidElement(child)) {
			if (child.type === StorySidePanel) {
				return cloneElement(child as React.ReactElement<any>, {
					onScroll,
					setSidePanelRef,
					panelLayout,
					activeStep,
					setActiveStep,
					setJumpSection,
					contentSize,
					isSmallScreen,
					visiblePanel,
				});
			} else if (sidePanelRef !== undefined || noSidePanel) {
				if (!isSmallScreen || visiblePanel === 'main') {
					return cloneElement(child as React.ReactElement<any>, {
						activeStep,
						setJumpSection,
						sidePanelRef,
						panelLayout,
						noSidePanel,
						isSmallScreen,
					});
				}
			}
		}
		return null;
	};

	return (
		<div
			className={classes}
			ref={ref}
			onTouchStart={handleTouchStart}
			onTouchMove={handleTouchMove}
			onTouchEnd={handleTouchEnd}
		>
			{Children.map(children, renderChild)}
			{isSmallScreen && (
				<div className="ptr-StoryPanelToggle">
					<SegmentedControl
						value={visiblePanel}
						onChange={(val) => setVisiblePanel(val as 'main' | 'side')}
						data={[
							{
								value: 'side',
								label: (
									<span className="ptr-StoryPanelToggle-icon">
										<IconTextCaption size={20} />
									</span>
								),
							},
							{
								value: 'main',
								label: (
									<span className="ptr-StoryPanelToggle-icon">
										<IconMap size={20} />
									</span>
								),
							},
						]}
						fullWidth
						color="gray"
						classNames={{
							root: 'ptr-StoryPanelToggle-segmented',
							label: 'ptr-StoryPanelToggle-label',
							// active: 'ptr-StoryPanelToggle-active',
						}}
						aria-label="Panel switch"
					/>
				</div>
			)}
		</div>
	);
};
