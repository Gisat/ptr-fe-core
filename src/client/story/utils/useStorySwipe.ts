import { useRef } from 'react';

/**
 * Hook providing touch swipe handlers to change a section index.
 *
 * @param setActiveSectionIndex - Function to update the active section index.
 * @param getMaxSectionIndex - Function to get the maximum valid section index.
 * @param minDistance - Minimum swipe distance to trigger a section change (default: 200).
 * @param minVelocity - Minimum swipe velocity to trigger a section change (default: 0.5).
 *
 * @returns An object containing touch event handlers: handleTouchStart, handleTouchMove, handleTouchEnd.
 */
export function useStorySwipe(
	setActiveSectionIndex: (updater: (prev: number) => number) => void,
	getMaxSectionIndex: () => number,
	minDistance = 200,
	minVelocity = 0.5
) {
	const touchStartXRef = useRef<number | null>(null);
	const touchEndXRef = useRef<number | null>(null);
	const touchStartTimeRef = useRef<number | null>(null);
	const touchEndTimeRef = useRef<number | null>(null);

	/**
	 * Handles the start of a touch event, capturing the initial touch position and time.
	 *
	 * @param e - The touch event.
	 */
	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		touchStartXRef.current = e.touches[0].clientX;
		touchStartTimeRef.current = Date.now();
	};

	/**
	 * Handles the movement of a touch event, capturing the current touch position.
	 *
	 * @param e - The touch event.
	 */
	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		touchEndXRef.current = e.touches[0].clientX;
	};

	/**
	 * Handles the end of a touch event, calculating the swipe distance and velocity.
	 * If the swipe meets the defined thresholds, it updates the active section index.
	 */
	const handleTouchEnd = () => {
		touchEndTimeRef.current = Date.now();
		if (
			touchStartXRef.current !== null &&
			touchEndXRef.current !== null &&
			touchStartTimeRef.current !== null &&
			touchEndTimeRef.current !== null
		) {
			const deltaX = touchEndXRef.current - touchStartXRef.current;
			const deltaTime = touchEndTimeRef.current - touchStartTimeRef.current;
			const velocity = Math.abs(deltaX) / deltaTime;

			// Check if swipe distance and velocity exceed thresholds
			if (Math.abs(deltaX) > minDistance && velocity > minVelocity) {
				if (deltaX < 0) {
					// Swipe left: go to the next section
					setActiveSectionIndex((prev) => Math.min(prev + 1, getMaxSectionIndex()));
				} else {
					// Swipe right: go to the previous section
					setActiveSectionIndex((prev) => Math.max(prev - 1, 0));
				}
			}
		}
		// Reset touch references
		touchStartXRef.current = null;
		touchEndXRef.current = null;
		touchStartTimeRef.current = null;
		touchEndTimeRef.current = null;
	};

	return { handleTouchStart, handleTouchMove, handleTouchEnd };
}
