/**
 * Removes duplicate objects from an array based on their `key` property.
 *
 * @template T - The type of objects in the array. Must include a `key` property.
 * @param {T[]} items - The array of objects to deduplicate.
 * @returns {T[]} A new array containing only the first occurrence of each unique `key`.
 */
export const deduplicateByKey = <T extends { key: any }>(items: T[]): T[] => {
	const seen = new Set(); // Tracks unique keys we've seen so far
	return items.filter((item) => {
		if (seen.has(item.key)) return false; // Skip if key already seen
		seen.add(item.key); // Mark this key as seen
		return true; // Include this item
	});
};
