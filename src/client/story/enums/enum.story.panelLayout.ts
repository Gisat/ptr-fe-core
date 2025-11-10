/**
 * Enum representing the layout mode for story panels.
 * Used to control how main and side panels are arranged in the UI.
 */
export enum StoryPanelLayout {
	/** Single panel layout (only one panel visible at a time, e.g. on small screens) */
	SINGLE = 'single',

	/** Vertical layout (main and side panels stacked vertically or side-by-side) */
	VERTICAL = 'vertical',

	/** Horizontal layout (main and side panels arranged horizontally) */
	HORIZONTAL = 'horizontal',
}
