import classnames from 'classnames';
import React from 'react';
import { Button } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { handleScrollDown } from '../sidePanel/navPanel/logic/handleScrollDown';
import './style.css';

type BackgroundImageType = string | { src: string };

/** Public presentational wrapper for the main panel intro. */
export interface StoryMainPanelIntroPublicProps {
	/** Optional additional class name for styling */
	className?: string;
	/** Child elements to render inside the intro */
	children: React.ReactNode;
	/** Optional background image for the intro */
	backgroundImage?: BackgroundImageType;
	/** Flag to disable the call-to-action button */
	disableCtaButton?: boolean;
	/** Text for the call-to-action button */
	ctaButtonText?: string;
}

/**
 * StoryMainPanelIntro Component
 *
 * This component serves as a public wrapper for the main panel intro in the story layout.
 * It allows for rendering child components and provides a call-to-action button to navigate
 * to the next section.
 *
 * @param {StoryMainPanelIntroPublicProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryMainPanelIntro component.
 */
export const StoryMainPanelIntro: React.FC<StoryMainPanelIntroPublicProps> & {
	__PTR_STORY_MAIN_PANEL_INTRO?: true; // Marker for internal detection
} = ({ children }) => <>{children}</>;

// Marker used for internal detection (prevents passing internal props from apps)
StoryMainPanelIntro.__PTR_STORY_MAIN_PANEL_INTRO = true;

interface StoryMainPanelIntroInternalProps {
	/** Optional additional class name for styling */
	className?: string;
	/** Child elements to render inside the intro */
	children: React.ReactNode;
	/** Optional background image for the intro */
	backgroundImage?: BackgroundImageType;
	/** Flag to disable the call-to-action button */
	disableCtaButton?: boolean;
	/** Text for the call-to-action button */
	ctaButtonText?: string;
	/** Reference to the side panel DOM element */
	sidePanelRef: React.RefObject<HTMLDivElement | null>;
	/** Currently active step index */
	activeStep: number;
	/** Function to update the active step index */
	setActiveStep: (step: number) => void;
	/** Number of children in the side panel */
	sidePanelChildrenCount: number;
	/** Flag to indicate if the screen is small */
	isSmallScreen: boolean;
}

/**
 * StoryMainPanelIntroInternal Component
 *
 * This component manages the internal functionality of the main panel intro, including
 * rendering the background image and the call-to-action button for navigating to the next section.
 *
 * @param {StoryMainPanelIntroInternalProps} props - The props for the component.
 * @returns {JSX.Element} The rendered StoryMainPanelIntroInternal component.
 */
export const StoryMainPanelIntroInternal: React.FC<StoryMainPanelIntroInternalProps> = ({
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
	const classes = (base: string) => classnames(base, className);

	/**
	 * Resolves the background image source.
	 * @param {BackgroundImageType | undefined} img - The background image input.
	 * @returns {string | undefined} The resolved image source.
	 */
	const resolveImageSrc = (img: BackgroundImageType | undefined): string | undefined =>
		!img ? undefined : typeof img === 'string' ? img : img.src;

	const backgroundImageUrl = resolveImageSrc(backgroundImage);
	const style = backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined;

	const sidePanelNodes = sidePanelRef?.current ? (Array.from(sidePanelRef.current.childNodes) as HTMLElement[]) : [];

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
