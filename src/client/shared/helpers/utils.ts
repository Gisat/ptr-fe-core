/**
 * Fetch function for SWR with redirect behavior
 * @param url - The endpoint to fetch data from
 * @param options - Redirect paths and optional fetch options
 */
export const swrFetcher = async (
	url: string,
	options?: {
		loginRedirectPath?: string;
		errorRedirectPath?: string;
		init?: RequestInit;
	}
) => {
	try {
		const res = await fetch(url, {
			redirect: 'manual',
			credentials: 'include', // Ensure cookies are sent
			...options?.init,
		});
		console.log(res);
		const currentPath = window.location.pathname;
		if (res.status === 401 && res.statusText === 'Unauthorized') {
			const loginBasePath = options?.loginRedirectPath;
			if (loginBasePath && currentPath.startsWith(`${loginBasePath}/`) && currentPath !== `${loginBasePath}/login`) {
				window.location.href = `${loginBasePath}/login`;
				return;
			}
		} else if (res.status >= 400 && res.status < 600) {
			// Handle client and server error responses
			const errorPath = options?.errorRedirectPath;
			if (errorPath && currentPath !== errorPath) {
				window.location.href = `${errorPath}?code=${res.status}&message=${encodeURIComponent(res.statusText)}`;
			}
		}
		return await res.json();
	} catch (error) {
		console.error('Fetch error:', error);
		throw error;
	}
};

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

/**
 * Feature interface for GeoJSON objects.
 * Represents the minimal structure needed for feature identification and property access.
 */
interface Feature {
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
