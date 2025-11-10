import React, { cloneElement, useEffect, useState } from 'react';
import classnames from 'classnames';
import { StoryPhaseType } from '../../enum.story.phaseType';
import { StoryActionType } from '../../enum.story.actionType';
import { renderActiveSection } from '../../helpers';
import './style.css';

export const StoryMainPanel = ({
	className,
	children = [],
	activeStep = 0,
	setActiveStep,
	sidePanelRef,
	panelLayout = 'horizontal',
	noSidePanel = false,
	animationDuration = 400,
	pauseBetweenSlides = 0,
	sidePanelChildrenCount,
}) => {
	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [phase, setPhase] = useState<StoryPhaseType>(StoryPhaseType.IDLE);
	const [direction, setDirection] = useState<StoryActionType>(StoryActionType.DOWN);
	const [wrapperStyle, setWrapperStyle] = useState({});

	const panelClasses = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className, {
		'ptr-StoryMainPanel--no-scroll': phase !== StoryPhaseType.IDLE,
	});

	useEffect(() => {
		if (activeStep !== displayedStep && phase === StoryPhaseType.IDLE) {
			setDirection(activeStep > displayedStep ? StoryActionType.DOWN : StoryActionType.UP);
			setPhase(StoryPhaseType.OUT);
			setWrapperStyle({});
		}
	}, [activeStep, displayedStep, phase]);

	useEffect(() => {
		if (phase === StoryPhaseType.OUT) {
			let transform;
			if (panelLayout === 'single') {
				transform = direction === StoryActionType.DOWN ? 'translateX(-100%)' : 'translateX(100%)';
			} else {
				transform = direction === StoryActionType.DOWN ? 'translateY(-100%)' : 'translateY(100%)';
			}
			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform,
				opacity: 0,
			});
			const timeout = setTimeout(() => {
				const pauseTimeout = setTimeout(() => {
					setPhase(StoryPhaseType.IN);
					let inTransform;
					if (panelLayout === 'single') {
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
	}, [phase, direction, activeStep, animationDuration, pauseBetweenSlides, panelLayout === 'single']);

	useEffect(() => {
		if (phase === StoryPhaseType.IN) {
			const raf = requestAnimationFrame(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: panelLayout === 'single' ? 'translateX(0)' : 'translateY(0)',
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

	useEffect(() => {
		if (phase === StoryPhaseType.IDLE) setWrapperStyle({});
	}, [phase]);

	return (
		<div className={panelClasses} style={noSidePanel ? { width: '100%' } : {}}>
			<div className="ptr-StoryMainPanel-contentWrapper">
				{renderActiveSection(children, displayedStep, wrapperStyle, {
					sidePanelRef,
					activeStep,
					isSmallScreen: panelLayout === 'single',
					setActiveStep,
					sidePanelChildrenCount,
				})}
			</div>
		</div>
	);
};
