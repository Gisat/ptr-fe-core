/**
 * Represents the structure needed for feature identification and property access.
 * @typedef {Object} Feature
 * @property {'Feature'} type - The GeoJSON feature type.
 * @property {string} [id] - Optional feature identifier.
 * @property {Object.<string, string>} [properties] - Optional feature properties.
 */
export interface Feature {
	type: 'Feature';
	id?: string;
	properties?: { [key: string]: string };
}
