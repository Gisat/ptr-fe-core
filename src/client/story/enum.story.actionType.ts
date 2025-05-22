/**
 * Enum representing action types for navigation within the story side panel.
 * These actions are used to control navigation between sections or adjust the view.
 */
export enum StoryActionType {
	/** Action to navigate to a specific section. */
	SECTION = 'section',

	/** Action to navigate upward in the side panel. */
	UP = 'up',

	/** Action to navigate downward in the side panel. */
	DOWN = 'down',
}