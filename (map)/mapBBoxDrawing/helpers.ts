/**
 * Determines if a given point is inside a specified polygon using the ray-casting algorithm.
 *
 * @param {number[][] | null} polygon - An array of [x, y] coordinates representing the polygon.
 * @param {[number, number]} point - An array [x, y] representing the point to check.
 * @returns {boolean | null} True if the point is inside the polygon, false if outside, and null if invalid input.
 */
export function isPointInPolygon(polygon: number[][] | null, point: [number, number]): boolean | null {
	if (polygon && point) {
			let odd = false;
			for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
					if (
							((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1])) && (point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))
					) {
									odd = !odd;
					}
					j = i;
			}
			return odd;
	} else {
			return null;
	}
}

/**
* Finds the closest number to the target in an array of numbers.
*
* @param {any[]} numbersArray - The array of numbers to search.
* @param {number} target - The target number to find the closest to.
* @returns {any} The closest number to the target in the array.
*/
export function findClosest(numbersArray: any[], target: number): any {
	if (numbersArray && target) {
			let res = numbersArray[0];
			for (let i = 1; i < numbersArray.length; i++) {
					// update the result if we find a closer element.
					if (numbersArray?.[i] && Math.abs(numbersArray[i] - target) <= Math.abs(res - target)) {
							res = numbersArray[i];
					}
			}
			return res;
	} else {
			return numbersArray;
	}
}

/**
 * Gets the index of the coordinates with the maximum sum from an array of bounding box coordinates.
 *
 * @param {number[][]} bboxCoordinates - An array of [x, y] coordinates representing the bounding box.
 * @returns {number} The index of the coordinates with the maximum sum.
 */
export function getMaxCoordinatesIndex(bboxCoordinates: number[][]): number {
	const sumValues = bboxCoordinates.map(coordinates => {
			return coordinates.reduce(function (x, y) {
					return x + y;
			}, 0);
	})

	const maxValue = Math.max(...sumValues);
	return sumValues.indexOf(maxValue);
}

/**
* Gets the index of the coordinates with the minimum sum from an array of bounding box coordinates.
*
* @param {number[][]} bboxCoordinates - An array of [x, y] coordinates representing the bounding box.
* @returns {number} The index of the coordinates with the minimum sum.
*/
export function getMinCoordinatesIndex(bboxCoordinates: number[][]): number {
	const sumValues = bboxCoordinates.map(coordinates => {
			return coordinates.reduce(function (x, y) {
					return x + y;
			}, 0);
	})

	const minValue = Math.min(...sumValues);
	return sumValues.indexOf(minValue);
}

/**
 * Rounds the coordinates to two decimal places.
 *
 * @param {number} coordinate - The coordinate to round.
 * @returns {string} The rounded coordinate.
 */
export const roundNumber = (coordinate: number): string => {
	return `${Math.round(coordinate * 100) / 100}`;
}

/**
 * Formats the coordinates as a string.
 *
 * @param {Array<number>} coordinates - The coordinates to format.
 * @returns {string} The formatted coordinates.
 */
export const formatCoordinates = (bboxCoordinates: Array<Array<number>>) =>
  bboxCoordinates.map((coordinates, index) => {
    return `[${coordinates.map((coordinate) => {
      return `${roundNumber(coordinate)}`;
    })}]${bboxCoordinates?.length - 1 !== index ? "," : ""} `;
  }).map(coordinate => coordinate.replace(",", ", ")).join("");