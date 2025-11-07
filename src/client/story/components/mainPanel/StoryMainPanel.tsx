import React, { cloneElement, useEffect, useState } from 'react';
import classnames from 'classnames';
import { StoryPhaseType } from '../../enum.story.phaseType';
import { StoryActionType } from '../../enum.story.actionType';
import './style.css';

/**
 * StoryMainPanel
 * Handles animated transitions between steps/screens in the story.
 * Only one child is rendered at a time, and transitions are handled via wrapper transforms.
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
	isSmallScreen,
}) => {
	const adjustedChildren = sidePanelRef?.current
		? Array.from(sidePanelRef.current.childNodes).map((_, i) => children[i] ?? <div key={i}></div>)
		: children;

	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<StoryPhaseType>(StoryPhaseType.IDLE);
	const [direction, setDirection] = useState<StoryActionType>(StoryActionType.DOWN);
	const [wrapperStyle, setWrapperStyle] = useState({});

	const panelClasses = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className, {
		'ptr-StoryMainPanel--no-scroll': phase !== StoryPhaseType.IDLE,
		'is-small-screen': isSmallScreen,
	});

	// Handle step change and set animation direction.
	useEffect(() => {
		if (activeStep !== displayedStep && phase === StoryPhaseType.IDLE) {
			setDirection(activeStep > displayedStep ? StoryActionType.DOWN : StoryActionType.UP);
			setPhase(StoryPhaseType.OUT);
			setWrapperStyle({});
		}
	}, [activeStep, displayedStep, phase]);

	// Animate out: slide/fade current screen away.
	useEffect(() => {
		if (phase === StoryPhaseType.OUT) {
			let transform;
			if (isSmallScreen) {
				// Slide left/right for small screens
				transform = direction === StoryActionType.DOWN ? 'translateX(-100%)' : 'translateX(100%)';
			} else {
				// Slide up/down for large screens
				transform = direction === StoryActionType.DOWN ? 'translateY(-100%)' : 'translateY(100%)';
			}
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform,
				opacity: 0,
			});
			const timeout = setTimeout(() => {
				// Optional pause before mounting next child
				const pauseTimeout = setTimeout(() => {
					setPhase(StoryPhaseType.IN);
					let inTransform;
					if (isSmallScreen) {
						inTransform = direction === StoryActionType.DOWN ? 'translateX(100%)' : 'translateX(-100%)';
					} else {
						inTransform = direction === StoryActionType.DOWN ? 'translateY(100%)' : 'translateY(-100%)';
					}
					setWrapperStyle({
						transition: 'none',
						transform: inTransform,
						opacity: 0,
					});
					setDisplayedStep(activeStep);
				}, pauseBetweenSlides);
				return () => clearTimeout(pauseTimeout);
			}, animationDuration);
			return () => clearTimeout(timeout);
		}
	}, [phase, direction, activeStep, animationDuration, pauseBetweenSlides, isSmallScreen]);

	// Animate in: slide/fade new screen in.
	useEffect(() => {
		if (phase === StoryPhaseType.IN) {
			const raf = requestAnimationFrame(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: 'translateX(0)',
					opacity: 1,
				});
			});
			const timeout = setTimeout(() => setPhase(StoryPhaseType.IDLE), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(timeout);
			};
		}
	}, [phase, animationDuration, isSmallScreen]);

	// Reset wrapper style when idle (no animation).
	useEffect(() => {
		if (phase === StoryPhaseType.IDLE) setWrapperStyle({});
	}, [phase]);

	return (
		<div className={panelClasses} style={noSidePanel ? { width: '100%' } : {}}>
			<div className="ptr-StoryMainPanel-contentWrapper" style={wrapperStyle}>
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
