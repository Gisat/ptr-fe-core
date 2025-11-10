import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import './style.css';
import { renderActiveSection } from '../../helpers';
import { StoryNavPanel } from './navPanel/StoryNavPanel';

/**
 * Props for the StorySidePanel component.
 */
interface StorySidePanelProps {
	className?: string;
	children?: React.ReactNode;
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
	setSidePanelRef?: (ref: React.RefObject<HTMLDivElement>) => void;
	setSidePanelChildrenCount?: (cnt: number) => void;
	panelLayout?: string; // 'single' | 'vertical' | 'horizontal'
	activeStep?: number;
	setActiveStep?: (n: number) => void;
	setJumpSection?: (n: number | null) => void;
	contentSize?: [number, number];
	visiblePanel?: string; // 'main' | 'side'
	hideNavigation?: boolean;
	fullNavigation?: boolean;
	navigationIcons?: {
		home?: React.ReactNode;
		case?: React.ReactNode;
		footer?: React.ReactNode;
	};
	sidePanelChildrenCount?: number;
}

export const StorySidePanel: React.FC<StorySidePanelProps> = ({
	className,
	children,
	onScroll,
	setSidePanelRef,
	setSidePanelChildrenCount,
	panelLayout,
	activeStep = 0,
	setActiveStep,
	setJumpSection,
	contentSize,
	visiblePanel,
	hideNavigation,
	fullNavigation,
	navigationIcons,
	sidePanelChildrenCount = 0,
}) => {
	const sidePanelRef = useRef<HTMLDivElement>(null);

	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
	const [direction, setDirection] = useState<'left' | 'right'>('right');
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
		if (panelLayout === 'single' && activeStep !== displayedStep && phase === 'idle') {
			setDirection(activeStep > displayedStep ? 'right' : 'left');
			setPhase('out');
			setWrapperStyle({});
		}
	}, [panelLayout, activeStep, displayedStep, phase]);

	useEffect(() => {
		if (panelLayout === 'single' && phase === 'out') {
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(.4,0,.2,1), opacity ${animationDuration}ms cubic-bezier(.4,0,.2,1)`,
				transform: direction === 'right' ? 'translateX(-100%)' : 'translateX(100%)',
				opacity: 0,
			});
			const t = setTimeout(() => {
				setPhase('in');
				setWrapperStyle({
					transition: 'none',
					transform: direction === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
					opacity: 0,
				});
				setDisplayedStep(activeStep);
			}, animationDuration);
			return () => clearTimeout(t);
		}
	}, [panelLayout, phase, direction, activeStep, animationDuration]);

	useEffect(() => {
		if (panelLayout === 'single' && phase === 'in') {
			const raf = requestAnimationFrame(() =>
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(.4,0,.2,1), opacity ${animationDuration}ms cubic-bezier(.4,0,.2,1)`,
					transform: 'translateX(0)',
					opacity: 1,
				})
			);
			const t = setTimeout(() => setPhase('idle'), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(t);
			};
		}
	}, [panelLayout, phase, animationDuration]);

	useEffect(() => {
		if (phase === 'idle') setWrapperStyle({});
	}, [phase]);

	const body =
		panelLayout === 'single'
			? renderActiveSection(children, displayedStep, wrapperStyle, {
					activeStep: displayedStep,
				})
			: children;

	// console.log(
	// 	panelLayout !== 'single',
	// 	!hideNavigation,
	// 	sidePanelRef.current,
	// 	sidePanelChildrenCount > 0,
	// 	sidePanelChildrenCount,
	// 	children,
	// 	React.Children.count(children)
	// );

	return (
		<div className={generateClasses('ptr-StorySidePanel-container')}>
			{panelLayout !== 'single' && !hideNavigation && sidePanelRef.current && (
				<StoryNavPanel
					activeStep={activeStep}
					setActiveStep={setActiveStep!}
					setJumpSection={setJumpSection}
					sidePanelRef={sidePanelRef as React.RefObject<HTMLDivElement>}
					sidePanelChildrenCount={React.Children.count(children)}
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
