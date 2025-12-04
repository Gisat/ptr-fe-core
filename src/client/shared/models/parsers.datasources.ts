// TODO: Add proper type definitions for DatasourceConfiguration if available

/**
 * Parses a datasource configuration from a string or object.
 *
 * @param {string | object | undefined} config - The datasource configuration to parse.
 * Can be a JSON string, an object, or undefined.
 *
 * @returns {object | undefined} - Returns the parsed configuration as an object if valid,
 * or `undefined` if the input is invalid or parsing fails.
 *
 * @example
 * // Parsing a JSON string
 * const config = parseDatasourceConfiguration('{"key": "value"}');
 * console.log(config); // { key: "value" }
 *
 * @example
 * // Passing an object directly
 * const config = parseDatasourceConfiguration({ key: "value" });
 * console.log(config); // { key: "value" }
 *
 * @example
 * // Handling invalid input
 * const config = parseDatasourceConfiguration('invalid json');
 * console.log(config); // undefined
 */
export const parseDatasourceConfiguration = (config: string | object | undefined) => {
	if (!config) {
		return undefined;
	}

	if (typeof config === 'object') {
		return config;
	}

	try {
		return JSON.parse(config);
	} catch (error) {
		console.error('Failed to parse datasource configuration:', error);
		return undefined;
	}
};
