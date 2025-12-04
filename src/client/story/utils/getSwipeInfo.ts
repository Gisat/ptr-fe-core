/**
 * Calculates swipe velocity and direction based on touch start and end positions.
 *
 * @param startX - The initial X coordinate of the touch event.
 * @param endX - The final X coordinate of the touch event.
 * @param startTime - The timestamp when the touch started.
 * @param endTime - The timestamp when the touch ended.
 *
 * @returns An object containing:
 * - deltaX: The distance swiped in the X direction.
 * - velocity: The calculated swipe velocity (pixels per millisecond).
 */
export function getSwipeInfo(startX: number, endX: number, startTime: number, endTime: number) {
	const deltaX = endX - startX; // Calculate the distance swiped
	const deltaTime = endTime - startTime; // Calculate the time taken for the swipe
	const velocity = Math.abs(deltaX) / (deltaTime || 1); // Calculate velocity, avoiding division by zero

	return { deltaX, velocity }; // Return the swipe distance and velocity
}
