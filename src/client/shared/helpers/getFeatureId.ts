/**
 * Feature interface for GeoJSON objects.
 * Represents the minimal structure needed for feature identification and property access.
 */
export interface Feature {
	type: 'Feature';
	id?: string;
	properties?: { [key: string]: string };
}

/**
 * Returns the unique identifier for a GeoJSON feature.
 * - By default, uses the RFC standard top-level "id" property.
 * - If a custom property name is provided, checks that in both top-level and properties.
 * - Does not guess other property names; only uses the provided or default.
 *
 * @param {Feature} feature - The GeoJSON feature object.
 * @param {string} [featureIdProperty='id'] - The preferred property name for the identifier.
 * @returns {string | undefined} The feature identifier if found, otherwise undefined.
 */
export function getFeatureId(feature: Feature, featureIdProperty?: string): string | undefined {
	const idProperty = featureIdProperty ?? 'id';

	// Check the configured property name at top-level (RFC standard)
	if (feature && feature[idProperty] !== undefined) {
		return feature[idProperty];
	}

	// Check the configured property name in properties object
	if (feature?.properties && feature.properties[idProperty] !== undefined) {
		return feature.properties[idProperty];
	}

	// If not found, return undefined and log a warning for debugging
	console.warn('GeoJSON feature identifier not found:', feature);
	return undefined;
}
