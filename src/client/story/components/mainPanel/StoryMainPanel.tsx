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
 * @param {number} [props.animationDuration=400] - Duration of the slide animation in ms.
 * @param {number} [props.pauseBetweenSlides=0] - Pause duration between slide transitions in ms.
 */
export const StoryMainPanel = ({
	className,
	children = [],
	activeStep = 0,
	sidePanelRef,
	panelLayout = 'horizontal',
	noSidePanel = false,
	animationDuration = 400,
	pauseBetweenSlides = 0,
}) => {
	// Ensure children match sidePanelRef nodes if present
	const adjustedChildren = sidePanelRef?.current
		? Array.from(sidePanelRef.current.childNodes).map((_, i) => children[i] ?? <div key={i}></div>)
		: children;

	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
	const [direction, setDirection] = useState<'up' | 'down'>('down');
	const [wrapperStyle, setWrapperStyle] = useState({});

	const panelClasses = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className, {
		'ptr-StoryMainPanel--no-scroll': phase !== 'idle',
	});

	// Handle step change and direction
	useEffect(() => {
		if (activeStep !== displayedStep && phase === 'idle') {
			setDirection(activeStep > displayedStep ? 'down' : 'up');
			setPhase('out');
			setWrapperStyle({});
		}
	}, [activeStep, displayedStep, phase]);

	// Animate out: slide/fade current screen away
	useEffect(() => {
		if (phase === 'out') {
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform: direction === 'down' ? 'translateY(-100%)' : 'translateY(100%)',
				opacity: 0,
			});
			const timeout = setTimeout(() => {
				setPhase('in');
				setWrapperStyle({
					transition: 'none',
					transform: direction === 'down' ? 'translateY(100%)' : 'translateY(-100%)',
					opacity: 0,
				});
				setDisplayedStep(activeStep);
			}, animationDuration + pauseBetweenSlides);
			return () => clearTimeout(timeout);
		}
	}, [phase, direction, activeStep, animationDuration, pauseBetweenSlides]);

	// Animate in: slide/fade new screen in
	useEffect(() => {
		if (phase === 'in') {
			// Use requestAnimationFrame for smoother start
			const raf = requestAnimationFrame(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: 'translateY(0)',
					opacity: 1,
				});
			});
			const timeout = setTimeout(() => setPhase('idle'), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(timeout);
			};
		}
	}, [phase, animationDuration]);

	// Reset style when idle
	useEffect(() => {
		if (phase === 'idle') setWrapperStyle({});
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
