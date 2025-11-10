import classnames from 'classnames';
import React, { ReactNode } from 'react';
import { Button } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { handleScrollDown } from '../sidePanel/navPanel/logic/handleScrollDown';
import './style.css';

type BackgroundImageType = string | { src: string };

/**
 * Props for the StoryMainPanelIntro component.
 */
interface StoryMainPanelIntroProps {
	/** Additional class names for styling */
	className?: string;
	/** Content to render inside the main panel intro */
	children: ReactNode;
	/** Reference to the side panel DOM node used for scrolling */
	sidePanelRef: React.RefObject<HTMLDivElement>;
	/** The currently active step index */
	activeStep: number;
	/**
	 * Setter for the active step (index of the currently visible section).
	 * Called after programmatic scroll (CTA or swipe) to sync state.
	 */
	setActiveStep: (step: number) => void;
	/** Total number of sections (side panel children) */
	sidePanelChildrenCount: number;
	/** Background image (string URL or object with src) */
	backgroundImage?: BackgroundImageType;
	/** Disable the call‑to‑action button when true */
	disableCtaButton?: boolean;
	/** Text label for the call‑to‑action button */
	ctaButtonText?: string;
	/**
	 * True when in single (small) layout; affects scroll behavior
	 * passed to navigation handlers for conditional logic.
	 */
	isSmallScreen: boolean;
}

/**
 * StoryMainPanelIntro
 *
 * Introductory hero/landing section for the main panel.
 * Renders a background image (optional), overlay content, and an optional CTA
 * button that scrolls to the next section in the side panel.
 */
export const StoryMainPanelIntro: React.FC<StoryMainPanelIntroProps> = ({
	className,
	children,
	sidePanelRef,
	activeStep,
	setActiveStep,
	sidePanelChildrenCount,
	backgroundImage = '',
	disableCtaButton,
	ctaButtonText = 'Proceed to next screen',
	isSmallScreen,
}) => {
	/**
	 * Combine base and custom class names.
	 */
	const classes = (baseClass: string): string => classnames(baseClass, className);

	/**
	 * Resolve an image source string from supported backgroundImage formats.
	 */
	const resolveImageSrc = (img: BackgroundImageType | undefined): string | undefined => {
		if (!img) return undefined;
		if (typeof img === 'string') return img;
		if ('src' in img) return img.src;
		return undefined;
	};

	/** Resolved background image URL (if any). */
	const backgroundImageUrl = resolveImageSrc(backgroundImage);

	/** Inline style object for background image. */
	const style = backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined;

	/**
	 * Cached list of side panel section nodes used for scroll navigation.
	 */
	const sidePanelNodes =
		sidePanelRef && sidePanelRef.current ? (Array.from(sidePanelRef.current.childNodes) as HTMLElement[]) : [];

	return (
		<div className={classes('ptr-StoryMainPanelIntro')} style={style}>
			<div className={classes('ptr-StoryMainPanelIntro-overlay')}>
				{children}
				{!disableCtaButton && (
					<Button
						className={classes('ptr-StoryMainPanelIntro-ctaButton')}
						onClick={() =>
							sidePanelRef &&
							handleScrollDown(
								sidePanelNodes,
								activeStep,
								sidePanelRef,
								sidePanelChildrenCount,
								isSmallScreen,
								setActiveStep
							)
						}
						variant="filled"
						rightSection={
							<div className="ptr-StoryMainPanelIntro-ctaButton-chevrons">
								<IconChevronDown size={16} className="ptr-StoryMainPanelIntro-ctaButton-chevronBlink-1" />
								<IconChevronDown size={16} className="ptr-StoryMainPanelIntro-ctaButton-chevronBlink-2" />
							</div>
						}
						aria-label="Scroll to next section"
					>
						{ctaButtonText}
					</Button>
				)}
			</div>
		</div>
	);
};
