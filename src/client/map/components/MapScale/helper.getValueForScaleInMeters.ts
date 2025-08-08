import { getOrderOfMagnitude } from './helper.getOrderOfMagnitude';

/**
 * Determines a suitable scale value in meters for display purposes.
 * The function normalizes the input value and adjusts it to a rounded, human-readable scale.
 *
 * @param maxScaleWidthInMeters - The maximum scale width in meters.
 * @returns A rounded scale value in meters suitable for display.
 */
export const getValueForScaleInMeters = (maxScaleWidthInMeters: number): number => {
	const orderOfMagnitude = getOrderOfMagnitude(maxScaleWidthInMeters);
	const coeff = Math.pow(10, orderOfMagnitude);
	const normalizedValue = maxScaleWidthInMeters / coeff;

	if (normalizedValue < 2) {
		return coeff;
	} else if (normalizedValue < 3) {
		return 2 * coeff;
	} else if (normalizedValue < 5) {
		return 3 * coeff;
	} else {
		return 5 * coeff;
	}
};
