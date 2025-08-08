/**
 * Calculates the order of magnitude of a given number.
 * The order of magnitude is the power of ten that most closely approximates the number.
 *
 * @param number - The input number for which the order of magnitude is calculated.
 * @returns The order of magnitude of the input number.
 */
export const getOrderOfMagnitude = (number: number): number => {
	// Add a small epsilon to account for floating-point precision errors in logarithm calculation.
	return Math.floor(Math.log(number) / Math.LN10 + 0.000000001);
};
