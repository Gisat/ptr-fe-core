import { ReactNode, useEffect, useState } from 'react';
import classnames from 'classnames';
import { StoryPhaseType } from '../../enums/enum.story.phaseType';
import { StoryActionType } from '../../enums/enum.story.actionType';
import { renderActiveSection } from '../../helpers';
import './style.css';

/**
 * Props for StoryMainPanel.
 */
interface StoryMainPanelProps {
	/** Optional custom class name */
	className?: string;
	/** Panel children (sections). Accepts an array or single React node */
	children: ReactNode;
	/** Currently active (target) section index */
	activeStep: number;
	/** Setter to update active section (lifted state) */
	setActiveStep: (index: number) => void;
	/** Ref to side panel (used for coordinated scroll actions) */
	sidePanelRef: React.RefObject<HTMLDivElement | undefined>;
	/** Current layout mode; animations switch axis when 'single' */
	panelLayout: 'horizontal' | 'vertical' | 'single';
	/** True if there is no side panel (main panel should span full width) */
	noSidePanel?: boolean;
	/** Duration of in/out transition (ms) */
	animationDuration?: number;
	/** Optional pause (ms) between OUT and IN phases */
	pauseBetweenSlides?: number;
	/** Total count of side panel sections (for CTA logic etc.) */
	sidePanelChildrenCount: number;
}

/**
 * StoryMainPanel
 *
 * Handles animated transitions between main panel "slides" (children) based on activeStep.
 * Animation phases:
 *  - IDLE: Stable. Interaction allowed.
 *  - OUT: Current slide animates out (opacity -> 0, translate away).
 *  - IN: New slide animates in (reset off‑screen then translate to 0).
 *
 * Direction is inferred by comparing new activeStep with displayedStep:
 *  - DOWN: Forward (next section)
 *  - UP: Backward (previous section)
 *
 * Axis choice:
 *  - 'single' layout => horizontal (translateX)
 *  - other layouts   => vertical (translateY)
 */
export const StoryMainPanel: React.FC<StoryMainPanelProps> = ({
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
	/** Slide currently rendered (may lag behind activeStep during animation) */
	const [displayedStep, setDisplayedStep] = useState(activeStep);
	/** Current animation phase */
	const [phase, setPhase] = useState<StoryPhaseType>(StoryPhaseType.IDLE);
	/** Direction of transition (UP / DOWN) */
	const [direction, setDirection] = useState<StoryActionType>(StoryActionType.DOWN);
	/** Inline style applied to animated wrapper */
	const [wrapperStyle, setWrapperStyle] = useState<Record<string, any>>({});

	/** Computed classes including phase-based scroll lock */
	const panelClasses = classnames('ptr-StoryMainPanel', `is-${panelLayout}-layout`, className, {
		'ptr-StoryMainPanel--no-scroll': phase !== StoryPhaseType.IDLE,
	});

	/**
	 * Detect step change -> start OUT phase.
	 */
	useEffect(() => {
		if (activeStep !== displayedStep && phase === StoryPhaseType.IDLE) {
			setDirection(activeStep > displayedStep ? StoryActionType.DOWN : StoryActionType.UP);
			setPhase(StoryPhaseType.OUT);
			setWrapperStyle({});
		}
	}, [activeStep, displayedStep, phase]);

	/**
	 * OUT phase: animate current slide out, then prepare IN phase (after optional pause).
	 */
	useEffect(() => {
		if (phase === StoryPhaseType.OUT) {
			const horizontal = panelLayout === 'single';
			const transform = horizontal
				? direction === StoryActionType.DOWN
					? 'translateX(-100%)'
					: 'translateX(100%)'
				: direction === StoryActionType.DOWN
					? 'translateY(-100%)'
					: 'translateY(100%)';

			setWrapperStyle({
				transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
				transform,
				opacity: 0,
			});

			const outTimeout = setTimeout(() => {
				const pauseTimeout = setTimeout(() => {
					setPhase(StoryPhaseType.IN);
					const inTransform = horizontal
						? direction === StoryActionType.DOWN
							? 'translateX(100%)'
							: 'translateX(-100%)'
						: direction === StoryActionType.DOWN
							? 'translateY(100%)'
							: 'translateY(-100%)';

					setWrapperStyle({
						transition: 'none',
						transform: inTransform,
						opacity: 0,
					});
					setDisplayedStep(activeStep);
				}, pauseBetweenSlides);
				return () => clearTimeout(pauseTimeout);
			}, animationDuration);

			return () => clearTimeout(outTimeout);
		}
	}, [phase, direction, activeStep, animationDuration, pauseBetweenSlides, panelLayout]);

	/**
	 * IN phase: animate new slide into place and end at IDLE.
	 */
	useEffect(() => {
		if (phase === StoryPhaseType.IN) {
			const horizontal = panelLayout === 'single';
			const raf = requestAnimationFrame(() => {
				setWrapperStyle({
					transition: `transform ${animationDuration}ms cubic-bezier(0.4,0,0.2,1), opacity ${animationDuration}ms cubic-bezier(0.4,0,0.2,1)`,
					transform: horizontal ? 'translateX(0)' : 'translateY(0)',
					opacity: 1,
				});
			});
			const inTimeout = setTimeout(() => setPhase(StoryPhaseType.IDLE), animationDuration);
			return () => {
				cancelAnimationFrame(raf);
				clearTimeout(inTimeout);
			};
		}
	}, [phase, animationDuration, panelLayout]);

	/**
	 * Reset transient styles after animation completes.
	 */
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
