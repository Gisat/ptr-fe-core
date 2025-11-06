import React, { cloneElement, useEffect, useState } from 'react';
import classnames from 'classnames';
import { StoryPhaseType } from '../../enum.story.phaseType';
import { StoryActionType } from '../../enum.story.actionType';
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
	// If sidePanelRef is present, ensure children match its nodes for layout sync
	const adjustedChildren = sidePanelRef?.current
		? Array.from(sidePanelRef.current.childNodes).map((_, i) => children[i] ?? <div key={i}></div>)
		: children;

	// State for currently displayed step, animation phase, direction, and wrapper style
	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<StoryPhaseType>(StoryPhaseType.IDLE);
	const [direction, setDirection] = useState<StoryActionType>(StoryActionType.DOWN);
	const [wrapperStyle, setWrapperStyle] = useState({});

	// Panel CSS classes, including layout and scroll lock during animation
	const panelClasses = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className, {
		'ptr-StoryMainPanel--no-scroll': phase !== StoryPhaseType.IDLE,
	});

	/**
	 * Handle step change and set animation direction.
	 * When activeStep changes, start the "out" phase and reset wrapper style.
	 */
	useEffect(() => {
		if (activeStep !== displayedStep && phase === StoryPhaseType.IDLE) {
			setDirection(activeStep > displayedStep ? StoryActionType.DOWN : StoryActionType.UP);
			setPhase(StoryPhaseType.OUT);
			setWrapperStyle({});
		}
	}, [activeStep, displayedStep, phase]);

	/**
	 * Animate out: slide/fade current screen away.
	 * After animationDuration, optionally pause, then mount the next child and start "in" phase.
	 */
	useEffect(() => {
		if (phase === StoryPhaseType.OUT) {
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform: direction === StoryActionType.DOWN ? 'translateY(-100%)' : 'translateY(100%)',
				opacity: 0,
			});
			const timeout = setTimeout(() => {
				// Optional pause before mounting next child
				const pauseTimeout = setTimeout(() => {
					setPhase(StoryPhaseType.IN);
					setWrapperStyle({
						transition: 'none',
						transform: direction === StoryActionType.DOWN ? 'translateY(100%)' : 'translateY(-100%)',
						opacity: 0,
					});
					setDisplayedStep(activeStep);
				}, pauseBetweenSlides);
				return () => clearTimeout(pauseTimeout);
			}, animationDuration);
			return () => clearTimeout(timeout);
		}
	}, [phase, direction, activeStep, animationDuration, pauseBetweenSlides]);

	/**
	 * Animate in: slide/fade new screen in.
	 * Uses requestAnimationFrame for smoother start.
	 * After animationDuration, set phase to idle.
	 */
	useEffect(() => {
		if (phase === StoryPhaseType.IN) {
			const raf = requestAnimationFrame(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: 'translateY(0)',
					opacity: 1,
				});
			});
			const timeout = setTimeout(() => setPhase(StoryPhaseType.IDLE), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(timeout);
			};
		}
	}, [phase, animationDuration]);

	/**
	 * Reset wrapper style when idle (no animation).
	 */
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
