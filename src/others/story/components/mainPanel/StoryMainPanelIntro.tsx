import React, { ReactNode } from 'react';
import classnames from 'classnames';
import { getImageProps, StaticImageData } from 'next/image';
import './style.css';

/**
 * Props for the StoryMainPanelIntro component.
 */
interface StoryMainPanelIntroProps {
    /** Additional class names for styling */
    className?: string;
    /** Content to render inside the main panel intro */
    children?: ReactNode;
    /** Background image (can be a StaticImageData object or a string URL) */
    backgroundImage?: StaticImageData | string;
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
 * @param {StaticImageData | string} [props.backgroundImage=""] - Background image for the panel.
 * @returns {JSX.Element} The rendered StoryMainPanelIntro component.
 */
export const StoryMainPanelIntro: React.FC<StoryMainPanelIntroProps> = ({
    className,
    children,
    backgroundImage = '',
}) => {
    /**
     * Generates dynamic class names by combining the base class with additional class names.
     * @param {string} baseClass - The base class name.
     * @returns {string} The combined class name.
     */
    const classes = (baseClass: string): string => classnames(baseClass, className);

    /**
     * Converts a srcSet string into a CSS `image-set` value.
     * @param {string} srcSet - The srcSet string containing image URLs and resolutions.
     * @returns {string} The CSS `image-set` value.
     */
    function getBackgroundImage(srcSet = ''): string {
        const imageSet = srcSet
            .split(', ')
            .map((str) => {
                const [url, dpi] = str.split(' ');
                return `url("${url}") ${dpi}`;
            })
            .join(', ');
        return `image-set(${imageSet})`;
    }

    // Extract srcSet from the background image using getImageProps
    const {
        props: { srcSet },
    } = getImageProps({ alt: '', width: 100, height: 100, src: backgroundImage });

    // Inline style for the background image
    const style = { backgroundImage: getBackgroundImage(srcSet) };

    return (
        <div className={classes('ptr-StoryMainPanelIntro')} style={style}>
            <div className={classes('ptr-StoryMainPanelIntro-overlay')}>{children}</div>
        </div>
    );
};