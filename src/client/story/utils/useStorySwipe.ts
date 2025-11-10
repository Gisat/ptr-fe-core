import { useRef } from 'react';

/**
 * Hook providing touch swipe handlers to change a section index.
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

	const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
		touchStartXRef.current = e.touches[0].clientX;
		touchStartTimeRef.current = Date.now();
	};

	const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
		touchEndXRef.current = e.touches[0].clientX;
	};

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

			if (Math.abs(deltaX) > minDistance && velocity > minVelocity) {
				if (deltaX < 0) {
					setActiveSectionIndex((prev) => Math.min(prev + 1, getMaxSectionIndex()));
				} else {
					setActiveSectionIndex((prev) => Math.max(prev - 1, 0));
				}
			}
		}
		touchStartXRef.current = null;
		touchEndXRef.current = null;
		touchStartTimeRef.current = null;
		touchEndTimeRef.current = null;
	};

	return { handleTouchStart, handleTouchMove, handleTouchEnd };
}
