import React, { ReactNode, cloneElement, useEffect, useState } from 'react';
import classnames from 'classnames';
import './style.css';

/**
 * StoryMainPanel
 * Handles animated transitions between steps/screens in the story.
 * Only one child is rendered at a time, and transitions are handled via wrapper transforms.
 *
 * @param {object} props
 * @param {string} [props.className] - Additional class names.
 * @param {ReactNode[]} [props.children] - The step components.
 * @param {number} [props.activeStep=0] - The current step index.
 * @param {React.RefObject<HTMLDivElement>} [props.sidePanelRef] - Ref to the side panel (for layout sync).
 * @param {string} [props.panelLayout='horizontal'] - Layout mode.
 * @param {boolean} [props.noSidePanel=false] - If true, disables side panel layout.
 */
export const StoryMainPanel = ({
	className,
	children = [],
	activeStep = 0,
	sidePanelRef,
	panelLayout = 'horizontal',
	noSidePanel = false,
}) => {
	// Adjust children if sidePanelRef is present and out of sync
	let adjustedChildren: ReactNode[] = children;
	if (sidePanelRef?.current) {
		const sidePanelNodes = Array.from(sidePanelRef.current.childNodes);
		if (sidePanelNodes.length !== children.length) {
			adjustedChildren = sidePanelNodes.map((_, index) =>
				children[index] ? children[index] : <div key={index}></div>
			);
		}
	}

	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
	const [direction, setDirection] = useState<'up' | 'down'>('down');
	const [wrapperStyle, setWrapperStyle] = useState({});
	const animationDuration = 700;

	const panelClasses = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className, {
		'ptr-StoryMainPanel--no-scroll': phase !== 'idle',
	});

	// Start transition on step change
	useEffect(() => {
		if (activeStep !== displayedStep && phase === 'idle') {
			setDirection(activeStep > displayedStep ? 'down' : 'up');
			setPhase('out');
			setWrapperStyle({}); // Reset style before animating out
		}
	}, [activeStep, displayedStep, phase]);

	// Animate out: slide current screen away
	useEffect(() => {
		if (phase === 'out') {
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform: direction === 'down' ? 'translateY(-100%)' : 'translateY(100%)',
				opacity: 0.7,
			});
			const timeout = setTimeout(() => {
				setPhase('in');
				// Instantly jump to opposite side, no transition
				setWrapperStyle({
					transition: 'none',
					transform: direction === 'down' ? 'translateY(100%)' : 'translateY(-100%)',
					opacity: 0.7,
				});
				setDisplayedStep(activeStep); // Swap to new child
			}, animationDuration);
			return () => clearTimeout(timeout);
		}
	}, [phase, direction, activeStep, animationDuration]);

	// Animate in: slide new screen into view
	useEffect(() => {
		if (phase === 'in') {
			const timeout = setTimeout(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: 'translateY(0)',
					opacity: 1,
				});
				// After animation, set to idle
				setTimeout(() => setPhase('idle'), animationDuration);
			}, 20); // Allow DOM to apply transform before animating in
			return () => clearTimeout(timeout);
		}
	}, [phase, animationDuration]);

	// Reset style when idle
	useEffect(() => {
		if (phase === 'idle') {
			setWrapperStyle({});
		}
	}, [phase]);

	return (
		<div className={panelClasses} style={noSidePanel ? { width: '100%' } : {}}>
			<div className="ptr-StoryMainPanel-content-wrapper" style={wrapperStyle}>
				<div className="ptr-StoryMainPanel-content">
					{cloneElement(adjustedChildren[displayedStep] as React.ReactElement<any>, {
						sidePanelRef,
						activeStep: displayedStep,
					})}
				</div>
			</div>
		</div>
	);
};
