import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import './style.css';
import { renderActiveSection } from '../../helpers';
import { StoryNavPanel } from './navPanel/StoryNavPanel';
import { StoryPhaseType } from '../../enums/enum.story.phaseType';
import { StoryPanelLayout } from '../../enums/enum.story.panelLayout';
import { StoryPanelDirection } from '../../enums/enum.story.sidePanelDirection';

/**
 * Props for the StorySidePanel component.
 */
interface StorySidePanelProps {
	className?: string;
	children: React.ReactNode;
	onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
	setSidePanelRef: (ref: React.RefObject<HTMLDivElement>) => void;
	setSidePanelChildrenCount: (cnt: number) => void;
	panelLayout: StoryPanelLayout;
	activeStep: number;
	setActiveStep: (n: number) => void;
	setJumpSection: (n: number | null) => void;
	contentSize?: [number, number];
	visiblePanel: string; // 'main' | 'side'
	hideNavigation?: boolean;
	fullNavigation?: boolean;
	navigationIcons?: {
		home?: React.ReactNode;
		case?: React.ReactNode;
		footer?: React.ReactNode;
	};
	sidePanelChildrenCount: number;
}

export const StorySidePanel: React.FC<StorySidePanelProps> = ({
	className,
	children,
	onScroll,
	setSidePanelRef,
	setSidePanelChildrenCount,
	panelLayout = StoryPanelLayout.HORIZONTAL,
	activeStep = 0,
	setActiveStep,
	setJumpSection,
	contentSize,
	visiblePanel,
	hideNavigation,
	fullNavigation,
	navigationIcons,
	sidePanelChildrenCount,
}) => {
	const sidePanelRef = useRef<HTMLDivElement>(null);

	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<StoryPhaseType>(StoryPhaseType.IDLE);
	const [direction, setDirection] = useState<StoryPanelDirection>(StoryPanelDirection.RIGHT);
	const [wrapperStyle, setWrapperStyle] = useState<React.CSSProperties>({});
	const animationDuration = 400;

	useEffect(() => {
		if (setSidePanelRef) setSidePanelRef(sidePanelRef as React.RefObject<HTMLDivElement>);
	}, [setSidePanelRef]);

	useEffect(() => {
		if (setSidePanelChildrenCount) {
			setSidePanelChildrenCount(children ? React.Children.count(children) : 0);
		}
	}, [children, setSidePanelChildrenCount]);

	const generateClasses = (base: string) =>
		classnames(base, `is-${panelLayout}-layout`, `is-${visiblePanel}-visible`, className);

	// Single layout slide animation
	useEffect(() => {
		if (panelLayout === StoryPanelLayout.SINGLE && activeStep !== displayedStep && phase === StoryPhaseType.IDLE) {
			setDirection(activeStep > displayedStep ? StoryPanelDirection.RIGHT : StoryPanelDirection.LEFT);
			setPhase(StoryPhaseType.OUT);
			setWrapperStyle({});
		}
	}, [panelLayout, activeStep, displayedStep, phase]);

	useEffect(() => {
		if (panelLayout === StoryPanelLayout.SINGLE && phase === StoryPhaseType.OUT) {
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(.4,0,.2,1), opacity ${animationDuration}ms cubic-bezier(.4,0,.2,1)`,
				transform: direction === StoryPanelDirection.RIGHT ? 'translateX(-100%)' : 'translateX(100%)',
				opacity: 0,
			});
			const t = setTimeout(() => {
				setPhase(StoryPhaseType.IN);
				setWrapperStyle({
					transition: 'none',
					transform: direction === StoryPanelDirection.RIGHT ? 'translateX(100%)' : 'translateX(-100%)',
					opacity: 0,
				});
				setDisplayedStep(activeStep);
			}, animationDuration);
			return () => clearTimeout(t);
		}
	}, [panelLayout, phase, direction, activeStep, animationDuration]);

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

	useEffect(() => {
		if (phase === StoryPhaseType.IDLE) setWrapperStyle({});
	}, [phase]);

	const body =
		panelLayout === StoryPanelLayout.SINGLE
			? renderActiveSection(children, displayedStep, wrapperStyle, {
					activeStep: displayedStep,
				})
			: children;

	return (
		<div className={generateClasses('ptr-StorySidePanel-container')}>
			{panelLayout !== StoryPanelLayout.SINGLE && !hideNavigation && sidePanelRef.current && (
				<StoryNavPanel
					activeStep={activeStep}
					setActiveStep={setActiveStep!}
					setJumpSection={setJumpSection}
					sidePanelRef={sidePanelRef as React.RefObject<HTMLDivElement>}
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
	);
};
