/**
 * Converts a hex color string to an RGB array.
 *
 * @param {string} hex - The hex color string (e.g., "#ff0000" or "ff0000").
 * @returns {[number, number, number]} The RGB color array, where each value is in the range 0-255.
 */
export function hexToRgbArray(hex: string): [number, number, number] {
	hex = hex.replace(/^#/, '');
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((x) => x + x)
			.join('');
	}
	const num = parseInt(hex, 16);
	return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}
