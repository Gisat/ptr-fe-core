/**
 * Calculates the ground resolution (meters per pixel) for a given latitude and zoom level.
 *
 * Ground resolution is the distance on the ground that is represented by one pixel on the map.
 * It varies depending on the latitude due to the curvature of the Earth and the map projection.
 *
 * @param latitude - The latitude in degrees (between -90 and 90).
 * @param zoomLevel - The zoom level (typically between 0 and 21 for web maps).
 * @returns The ground resolution in meters per pixel.
 */
export const getGroundResolution = (latitude: number, zoomLevel: number): number => {
	const earthRadius = 6378137; // in meters (used in Web Mercator projection)
	const tileSize = 512; // pixels per tile at zoom level 0, Deck.gl uses 512 pixels as the standard tile size

	// Convert latitude from degrees to radians
	const latRad = (latitude * Math.PI) / 180;

	// Calculate ground resolution
	return (Math.cos(latRad) * 2 * Math.PI * earthRadius) / (tileSize * Math.pow(2, zoomLevel));
};
