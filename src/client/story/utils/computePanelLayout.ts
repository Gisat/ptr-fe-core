import { StoryPanelLayout } from '../enums/enum.story.panelLayout';

/**
 * Computes the layout mode based on the provided width, height, and defined breakpoints.
 *
 * @param width - The current width of the container.
 * @param height - The current height of the container.
 * @param smallW - The width breakpoint for small screens.
 * @param smallH - The height breakpoint for small screens.
 * @param mediumW - The width breakpoint for medium screens.
 * @param mediumH - The height breakpoint for medium screens.
 *
 * @returns The computed layout mode as a StoryPanelLayout value.
 */
export function computePanelLayout(
	width: number,
	height: number,
	smallW: number,
	smallH: number,
	mediumW: number,
	mediumH: number
): StoryPanelLayout {
	// Determine if the current dimensions are within the small screen limits
	const isSmall = width <= smallW || height <= smallH;
	if (isSmall) return StoryPanelLayout.SINGLE; // Return SINGLE layout for small screens

	// Determine if the current dimensions are within the medium screen limits
	const isMedium = (width <= mediumW && width > smallW) || (height <= mediumH && height > smallH);
	if (isMedium) return StoryPanelLayout.VERTICAL; // Return VERTICAL layout for medium screens

	// Default to HORIZONTAL layout for larger screens
	return StoryPanelLayout.HORIZONTAL;
}
