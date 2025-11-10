import { StoryPanelLayout } from '../enums/enum.story.panelLayout';

/**
 * Compute layout mode based on width/height and breakpoints.
 */
export function computeStoryPanelLayout(
	width: number,
	height: number,
	smallW: number,
	smallH: number,
	mediumW: number,
	mediumH: number
): StoryPanelLayout {
	const isSmall = width <= smallW || height <= smallH;
	if (isSmall) return StoryPanelLayout.SINGLE;

	const isMedium = (width <= mediumW && width > smallW) || (height <= mediumH && height > smallH);

	if (isMedium) return StoryPanelLayout.VERTICAL;
	return StoryPanelLayout.HORIZONTAL;
}
