import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import './style.css';
import { renderActiveSection } from '../../helpers';

/**
 * Props for the StorySidePanel component.
 */
interface StorySidePanelProps {
	className?: string;
	children?: React.ReactNode;
	onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
	setSidePanelRef?: (ref: React.RefObject<HTMLDivElement>) => void;
	panelLayout?: string;
	activeStep?: number;
	setActiveStep?: (step: number) => void;
	setJumpSection?: (section: number) => void;
	contentSize?: [number, number];
	hideNavigation?: boolean;
	navigationIcons?: {
		home?: React.ReactNode;
		case?: React.ReactNode;
		footer?: React.ReactNode;
	};
	fullNavigation?: boolean;
	isSmallScreen?: boolean;
	visiblePanel?: string;
}

/**
 * StorySidePanel Component
 * On small screens, animates slide left/right between sections.
 * All children are rendered, but only the active one is visible.
 * Navigation panel is now handled outside this component.
 */
export const StorySidePanel: React.FC<StorySidePanelProps> = ({
	className,
	children,
	onScroll,
	setSidePanelRef,
	setSidePanelChildrenCount,
	panelLayout,
	activeStep = 0,
	isSmallScreen,
	visiblePanel,
}) => {
	const sidePanelRef = useRef<HTMLDivElement>(null);

	// Animation state for small screens
	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
	const [direction, setDirection] = useState<'left' | 'right'>('right');
	const [wrapperStyle, setWrapperStyle] = useState({});
	const animationDuration = 400;

	// Set the side panel reference when the component mounts
	useEffect(() => {
		if (setSidePanelRef && sidePanelRef) {
			setSidePanelRef(sidePanelRef as React.RefObject<HTMLDivElement>);
		}
	}, [setSidePanelRef]);

	useEffect(() => {
		if (setSidePanelChildrenCount) {
			setSidePanelChildrenCount(children ? React.Children.count(children) : 0);
		}
	}, [setSidePanelChildrenCount]);

	// Generate class names dynamically
	const generateClasses = (baseClass: string): string => {
		return classnames(baseClass, `is-${panelLayout}-layout`, `is-${visiblePanel}-visible`, className, {
			'is-small-screen': isSmallScreen,
		});
	};

	// Handle step change and set animation direction
	useEffect(() => {
		if (isSmallScreen && activeStep !== displayedStep && phase === 'idle') {
			setDirection(activeStep > displayedStep ? 'right' : 'left');
			setPhase('out');
			setWrapperStyle({});
		}
	}, [activeStep, displayedStep, phase, isSmallScreen]);

	// Animate out: slide current screen away
	useEffect(() => {
		if (isSmallScreen && phase === 'out') {
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform: direction === 'right' ? 'translateX(-100%)' : 'translateX(100%)',
				opacity: 0,
			});
			const timeout = setTimeout(() => {
				setPhase('in');
				setWrapperStyle({
					transition: 'none',
					transform: direction === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
					opacity: 0,
				});
				setDisplayedStep(activeStep);
			}, animationDuration);
			return () => clearTimeout(timeout);
		}
	}, [phase, direction, activeStep, animationDuration, isSmallScreen]);

	// Animate in: slide new screen in
	useEffect(() => {
		if (isSmallScreen && phase === 'in') {
			const raf = requestAnimationFrame(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: 'translateX(0)',
					opacity: 1,
				});
			});
			const timeout = setTimeout(() => setPhase('idle'), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(timeout);
			};
		}
	}, [phase, animationDuration, isSmallScreen]);

	// Reset wrapper style when idle
	useEffect(() => {
		if (phase === 'idle') setWrapperStyle({});
	}, [phase]);

	return (
		<div className={generateClasses('ptr-StorySidePanel-container')}>
			<div className={generateClasses('ptr-StorySidePanel')} ref={sidePanelRef} onScroll={onScroll}>
				{isSmallScreen ? renderActiveSection(children, displayedStep, wrapperStyle) : children}
			</div>
		</div>
	);
};
