import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { StoryNavPanel } from './navPanel/StoryNavPanel';
import './style.css';

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
 */
export const StorySidePanel: React.FC<StorySidePanelProps> = ({
	className,
	children,
	onScroll,
	setSidePanelRef,
	panelLayout,
	activeStep = 0,
	setActiveStep,
	setJumpSection,
	contentSize,
	hideNavigation = false,
	navigationIcons,
	fullNavigation = true,
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

	// Generate class names dynamically
	const generateClasses = (baseClass: string): string => {
		return classnames(
			baseClass,
			{ 'hide-navigation': hideNavigation },
			`is-${panelLayout}-layout`,
			`is-${visiblePanel}-visible`,
			className
		);
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
			{/* Render the navigation panel if navigation is not hidden */}
			{sidePanelRef.current && !hideNavigation ? (
				<StoryNavPanel
					activeStep={activeStep}
					setActiveStep={setActiveStep}
					setJumpSection={setJumpSection}
					sidePanelRef={sidePanelRef as React.RefObject<HTMLDivElement>}
					contentSize={contentSize}
					navigationIcons={navigationIcons}
					fullNavigation={fullNavigation}
					isSmallScreen={isSmallScreen}
				/>
			) : null}

			<div
				className={generateClasses('ptr-StorySidePanel')}
				ref={sidePanelRef}
				onScroll={onScroll}
				style={{ display: visiblePanel === 'side' ? undefined : 'none' }}
			>
				{isSmallScreen
					? React.Children.toArray(children).map((child, idx) => (
							<div
								key={idx}
								className={classnames('ptr-StorySidePanel-case', 'ptr-StorySidePanel-slide-wrapper', {
									hidden: idx !== displayedStep,
								})}
								onScroll={onScroll}
								style={idx === displayedStep ? wrapperStyle : { display: 'none' }}
							>
								{child}
							</div>
						))
					: children}
			</div>
		</div>
	);
};
