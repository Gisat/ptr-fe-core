/**
 * Enum representing the type of panel in the story layout.
 * Used to distinguish between the main content panel and the side (text/info) panel.
 */
export enum StoryPanelType {
	/** Main content panel (e.g., map, visualization, etc.) */
	MAIN = 'main',

	/** Side panel (e.g., text, info, navigation, etc.) */
	SIDE = 'side',
}
