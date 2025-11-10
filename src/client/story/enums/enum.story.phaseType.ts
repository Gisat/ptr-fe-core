/**
 * Enum representing the animation phase for story panel transitions.
 * Used to control whether the panel is idle, animating out, or animating in.
 */
export enum StoryPhaseType {
	/** No transition is occurring; panel is idle and fully visible. */
	IDLE = 'idle',

	/** Panel is animating out (leaving the view). */
	OUT = 'out',

	/** Panel is animating in (entering the view). */
	IN = 'in',
}
