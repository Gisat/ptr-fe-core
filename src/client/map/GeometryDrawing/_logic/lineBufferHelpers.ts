/**
 * Geodetic helpers for building a corridor (buffer) polygon around a polyline.
 *
 * ## Overview
 * Given a polyline (sequence of [lon, lat] vertices) and a half-width distance,
 * this module computes a closed GeoJSON-compatible polygon that represents the
 * corridor around the line – i.e. all points within `bufferMeters` of the line.
 *
 * ## Coordinate system
 * All coordinates are **[longitude, latitude]** in decimal degrees (WGS-84),
 * matching the GeoJSON convention used throughout the application.
 *
 * ## Geodetic model
 * All distance and direction calculations use the **spherical-earth (Haversine)**
 * model with R = 6 371 000 m.  This is accurate to ~0.3 % for buffers up to a
 * few kilometres and avoids the distortion that flat-earth Mercator arithmetic
 * would introduce, especially at higher latitudes.
 */

/** Mean Earth radius in metres used for all spherical calculations. */
const R = 6371000;

/** Converts decimal degrees to radians. */
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Converts radians to decimal degrees. */
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Computes the destination point reached by travelling `distanceM` metres
 * from `origin` in the direction `bearingRad`.
 *
 * Uses the spherical "direct problem" formula:
 * ```
 * φ₂ = asin( sin(φ₁)·cos(d) + cos(φ₁)·sin(d)·cos(θ) )
 * λ₂ = λ₁ + atan2( sin(θ)·sin(d)·cos(φ₁), cos(d) − sin(φ₁)·sin(φ₂) )
 * ```
 * where φ = latitude, λ = longitude, d = angular distance (distanceM / R),
 * θ = bearing in radians.
 *
 * @param origin     Starting point as [lon, lat] in decimal degrees.
 * @param distanceM  Travel distance in metres.
 * @param bearingRad Bearing in radians, measured clockwise from north
 *                   (0 = north, π/2 = east, π = south, 3π/2 = west).
 * @returns          Destination point as [lon, lat] in decimal degrees.
 */
function destinationPoint(
	origin: [number, number],
	distanceM: number,
	bearingRad: number
): [number, number] {
	const distRad = distanceM / R;
	const lat1 = toRad(origin[1]);
	const lon1 = toRad(origin[0]);
	const lat2 = Math.asin(
		Math.sin(lat1) * Math.cos(distRad) + Math.cos(lat1) * Math.sin(distRad) * Math.cos(bearingRad)
	);
	const lon2 =
		lon1 +
		Math.atan2(
			Math.sin(bearingRad) * Math.sin(distRad) * Math.cos(lat1),
			Math.cos(distRad) - Math.sin(lat1) * Math.sin(lat2)
		);
	return [toDeg(lon2), toDeg(lat2)];
}

/**
 * Computes the initial geodetic bearing (in radians) from `pointA` to `pointB`.
 *
 * Uses the spherical "inverse problem" formula:
 * ```
 * θ = atan2( sin(Δλ)·cos(φ₂),
 *            cos(φ₁)·sin(φ₂) − sin(φ₁)·cos(φ₂)·cos(Δλ) )
 * ```
 * The result is in the range (−π, π].  Positive values are east of north,
 * negative values are west of north.
 *
 * @param pointA  Origin as [lon, lat] in decimal degrees.
 * @param pointB  Destination as [lon, lat] in decimal degrees.
 * @returns       Initial bearing in radians (clockwise from north).
 */
function bearing(pointA: [number, number], pointB: [number, number]): number {
	const lat1 = toRad(pointA[1]);
	const lat2 = toRad(pointB[1]);
	const dLon = toRad(pointB[0] - pointA[0]);
	return Math.atan2(
		Math.sin(dLon) * Math.cos(lat2),
		Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
	);
}

/**
 * Builds a closed corridor polygon around a polyline with **flat caps**.
 *
 * ## Algorithm
 *
 * ### Step 1 – Per-vertex bearing
 * For each vertex a representative forward bearing is determined:
 * - **First vertex**: bearing of the first segment (→ second point).
 * - **Last vertex**: bearing of the last segment (← from second-to-last point).
 * - **Interior vertices**: *circular mean* of the incoming and outgoing bearings.
 *   A circular mean (via `atan2(mean(sin), mean(cos))`) is used instead of a
 *   plain average to handle wrap-around correctly (e.g. 350° and 10° → 0°,
 *   not the erroneous 180° that arithmetic average would give).
 *
 * ### Step 2 – Perpendicular offsets
 * From the representative bearing of each vertex, two offset points are computed
 * using {@link destinationPoint}:
 * - **Right side**: `bearing + π/2` (90° clockwise = right of travel direction).
 * - **Left side**: `bearing − π/2` (90° counter-clockwise = left of travel direction).
 *
 * For endpoint vertices the bearing equals the adjacent segment's bearing, so the
 * offset edge is exactly perpendicular to the line at that point – this is what
 * produces the **flat cap** geometry (no semicircular rounding).
 *
 * ### Step 3 – Ring assembly
 * ```
 * leftSide[0] ←──────────────── leftSide[n]
 *     │   (start flat cap)   (end flat cap)   │
 * rightSide[0] ──────────────── rightSide[n]
 * ```
 * The ring is assembled as:
 * ```
 * [ rightSide[0..n], leftSide[n..0] (reversed), rightSide[0] (close) ]
 * ```
 * The direct connection `rightSide[n] → leftSide[n]` is the **flat end cap** –
 * a straight edge perpendicular to the line at the last point.
 * The direct connection `leftSide[0] → rightSide[0]` (after reversal + close)
 * is the **flat start cap** – a straight edge perpendicular at the first point.
 *
 * The resulting ring has no self-intersections and correct winding order for a
 * GeoJSON Polygon exterior ring (counter-clockwise when viewed on a standard map).
 *
 * @param coords       Ordered [lon, lat] vertices of the polyline (≥ 2 required).
 *                     Fewer than 2 points returns an empty array.
 * @param bufferMeters Corridor **half-width** in metres.  The total corridor width
 *                     is `2 × bufferMeters`.
 * @returns            Closed ring of [lon, lat] pairs suitable for use as the
 *                     exterior ring of a GeoJSON `Polygon` geometry.
 */
export function buildLineBufferPolygon(
	coords: [number, number][],
	bufferMeters: number
): [number, number][] {
	if (coords.length < 2) return [];

	const rightSide: [number, number][] = [];
	const leftSide: [number, number][] = [];

	for (let vertexIndex = 0; vertexIndex < coords.length; vertexIndex++) {
		let segBearing: number;

		if (vertexIndex === 0) {
			// First point: use bearing of first segment only
			segBearing = bearing(coords[0], coords[1]);
		} else if (vertexIndex === coords.length - 1) {
			// Last point: use bearing of last segment only
			segBearing = bearing(coords[vertexIndex - 1], coords[vertexIndex]);
		} else {
			// Interior point: circular mean of incoming and outgoing bearings.
			// atan2(mean(sin), mean(cos)) handles the 0/2π wrap-around correctly.
			const bearing1 = bearing(coords[vertexIndex - 1], coords[vertexIndex]);
			const bearing2 = bearing(coords[vertexIndex], coords[vertexIndex + 1]);
			const sinAvg = (Math.sin(bearing1) + Math.sin(bearing2)) / 2;
			const cosAvg = (Math.cos(bearing1) + Math.cos(bearing2)) / 2;
			segBearing = Math.atan2(sinAvg, cosAvg);
		}

		// Right offset: 90° clockwise from forward bearing
		rightSide.push(destinationPoint(coords[vertexIndex], bufferMeters, segBearing + Math.PI / 2));
		// Left offset:  90° counter-clockwise from forward bearing
		leftSide.push(destinationPoint(coords[vertexIndex], bufferMeters, segBearing - Math.PI / 2));
	}

	// Ring: right side (start→end), then left side reversed (end→start), then close.
	// The direct connections at both ends ARE the flat perpendicular caps.
	const ring: [number, number][] = [
		...rightSide,
		...[...leftSide].reverse(),
	];

	// Close the ring by repeating the first vertex
	ring.push(ring[0]);

	return ring;
}
