import React, { ReactNode, cloneElement, useEffect, useState } from 'react';
import classnames from 'classnames';
import './style.css';

export const StoryMainPanel = ({
	className,
	children = [],
	activeStep = 0,
	sidePanelRef,
	panelLayout = 'horizontal',
	noSidePanel = false,
}) => {
	const classes = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className);

	let adjustedChildren = children;
	if (sidePanelRef?.current) {
		const sidePanelNodes = Array.from(sidePanelRef.current.childNodes);
		if (sidePanelNodes.length !== children.length) {
			adjustedChildren = sidePanelNodes.map((_, index) =>
				children[index] ? children[index] : <div key={index}></div>
			);
		}
	}

	const [displayedStep, setDisplayedStep] = useState(activeStep);
	const [pendingStep, setPendingStep] = useState<number | null>(null);
	const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
	const [direction, setDirection] = useState<'up' | 'down'>('down');
	const [enteringAnimating, setEnteringAnimating] = useState(false);

	// When activeStep changes, start transition
	useEffect(() => {
		if (activeStep !== displayedStep && phase === 'idle') {
			setDirection(activeStep > displayedStep ? 'down' : 'up');
			setPendingStep(activeStep);
			setPhase('out');
		}
	}, [activeStep, displayedStep, phase]);

	// Handle transition phases
	useEffect(() => {
		if (phase === 'out') {
			const timeout = setTimeout(() => setPhase('in'), 700); // match CSS duration
			return () => clearTimeout(timeout);
		}
		if (phase === 'in') {
			setEnteringAnimating(false);
			const timeout = setTimeout(() => {
				setPhase('idle');
				if (pendingStep !== null) {
					setDisplayedStep(pendingStep);
					setPendingStep(null);
				}
			}, 700);
			return () => clearTimeout(timeout);
		}
	}, [phase, pendingStep]);

	// Animate entering screen
	useEffect(() => {
		if (phase === 'in') {
			setEnteringAnimating(false);
			const id = setTimeout(() => setEnteringAnimating(true), 10);
			return () => clearTimeout(id);
		}
	}, [phase, pendingStep]);

	// Only render the two relevant children during transition, or just one when idle
	let content = null;
	if (phase === 'out' && displayedStep !== null) {
		content = (
			<div
				key={`out-${displayedStep}`}
				className={classnames(
					'ptr-StoryMainPanel-content',
					direction === 'down' ? 'ptr-StoryMainPanel-slide-out-up' : 'ptr-StoryMainPanel-slide-out-down'
				)}
			>
				{cloneElement(adjustedChildren[displayedStep] as React.ReactElement<any>, {
					sidePanelRef,
					activeStep: displayedStep,
				})}
			</div>
		);
	} else if (phase === 'in' && pendingStep !== null) {
		content = (
			<div
				key={`in-${pendingStep}`}
				className={classnames(
					'ptr-StoryMainPanel-content',
					direction === 'down' ? 'ptr-StoryMainPanel-slide-in-up' : 'ptr-StoryMainPanel-slide-in-down',
					{ animating: enteringAnimating }
				)}
			>
				{cloneElement(adjustedChildren[pendingStep] as React.ReactElement<any>, {
					sidePanelRef,
					activeStep: pendingStep,
				})}
			</div>
		);
	} else if (phase === 'idle') {
		content = (
			<div className="ptr-StoryMainPanel-content" key={`idle-${displayedStep}`}>
				{cloneElement(adjustedChildren[displayedStep] as React.ReactElement<any>, {
					sidePanelRef,
					activeStep: displayedStep,
				})}
			</div>
		);
	}

	return (
		<div className={classes} style={noSidePanel ? { width: '100%' } : {}}>
			<div className="ptr-StoryMainPanel-content-wrapper">{content}</div>
		</div>
	);
};
