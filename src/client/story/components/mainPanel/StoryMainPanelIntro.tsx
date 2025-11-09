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
	children?: ReactNode;
	/** Reference to the side panel DOM node */
	sidePanelRef?: React.RefObject<HTMLDivElement>;
	/** The currently active step index */
	activeStep?: number;
	/** Background image (can be a StaticImageData object or a string URL) */
	backgroundImage?: BackgroundImageType;
	/** Whether to disable the call-to-action button */
	disableCtaButton?: boolean;
	/** Text for the call-to-action button */
	ctaButtonText?: string;
}

/**
 * StoryMainPanelIntro Component
 *
 * This component represents the introductory section of the main panel in a story layout.
 * It displays a background image and overlays content, such as headlines or descriptions.
 *
 * @param {StoryMainPanelIntroProps} props - The props for the component.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {ReactNode} [props.children] - Content to render inside the main panel intro.
 * @param {BackgroundImageType} [props.backgroundImage=""] - Background image for the panel.
 * @returns {JSX.Element} The rendered StoryMainPanelIntro component.
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
	 * Generates dynamic class names by combining the base class with additional class names.
	 * @param {string} baseClass - The base class name.
	 * @returns {string} The combined class name.
	 */
	const classes = (baseClass: string): string => classnames(baseClass, className);

	/**
	 * Resolves the image source URL from a given background image input.
	 *
	 * This function handles two possible types of input:
	 * - A plain string representing the image URL (e.g., "/images/bg.jpg" or external CDN URL).
	 * - An object with a `src` property (e.g., a `StaticImageData` object from a Webpack/Next.js import).
	 *
	 * @param {BackgroundImageType | undefined} img - The background image input to resolve.
	 * @returns {string | undefined} The resolved image URL as a string, or undefined if input is invalid.
	 */
	const resolveImageSrc = (img: BackgroundImageType | undefined): string | undefined => {
		if (!img) return undefined;
		if (typeof img === 'string') return img;
		if ('src' in img) return img.src;
		return undefined;
	};

	/**
	 * The resolved background image URL, derived from the `backgroundImage` prop.
	 * This value is used to set the inline `backgroundImage` style in the component.
	 */
	const backgroundImageUrl = resolveImageSrc(backgroundImage);

	// Inline style for the background image
	const style = backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined;

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
					>
						{ctaButtonText}
					</Button>
				)}
			</div>
		</div>
	);
};
