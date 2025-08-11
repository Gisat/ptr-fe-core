/**
 * Feature interface for GeoJSON objects.
 * Represents the minimal structure needed for feature identification and property access.
 */
export interface Feature {
	type: 'Feature';
	id?: string | number;
	properties?: { [key: string]: string | number };
}

/**
 * Returns the unique identifier for a GeoJSON feature.
 *
 * By default, uses the RFC 7946 standard top-level "id" property.
 * If a custom property name is provided, checks that property in both the top-level and the properties object.
 * Throws an error if no identifier is found.
 *
 * @param {Feature} feature - The GeoJSON feature object.
 * @param {string} [featureIdProperty='id'] - The property name to use for the identifier (defaults to "id").
 * @returns {string | number} The feature identifier if found.
 * @throws {Error} If the feature does not have an identifier.
 */
export function getFeatureId(feature: Feature, featureIdProperty?: string): string | number {
	const idProperty = featureIdProperty ?? 'id';

	// Check the configured property name at top-level (RFC standard)
	if (feature && feature[idProperty] !== undefined) {
		return feature[idProperty];
	}

	// Check the configured property name in properties object
	if (feature?.properties && feature.properties[idProperty] !== undefined) {
		return feature.properties[idProperty];
	}

	// Throw an error if no identifier is found
	throw new Error(`GeoJSON feature identifier not found for property "${idProperty}". Feature: ${feature}`);
}
