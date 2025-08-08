/**
 * Formats a numeric value into a human-readable string with appropriate units.
 * Values less than 1000 are displayed in meters (m), while larger values are converted to kilometers (km).
 *
 * @param value - The numeric value to format.
 * @returns The formatted string with units (e.g., "500 m" or "1.5 km").
 */
export const getFormattedLabel = (value: number): string => {
	if (value < 1000) {
		return `${value} m`;
	} else {
		return `${(value / 1000).toLocaleString()} km`;
	}
};
