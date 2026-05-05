/**
 * Geodetic helpers for building a corridor (buffer) polygon around a polyline.
 *
 * ## Overview
 * Given a polyline (sequence of [lon, lat] vertices) and a half-width distance,
 * this module computes a closed GeoJSON-compatible polygon that represents the
 * corridor around the line — i.e. all points within `bufferMeters` of the line.
 *
 * ## Coordinate system
 * All coordinates are **[longitude, latitude]** in decimal degrees (WGS-84),
 * matching the GeoJSON convention used throughout the application.
 *
 * ## Geodetic model
 * All distance and direction calculations use the **spherical-earth (Haversine)**
 * model with R = 6 371 000 m. Accurate to ~0.3% for buffers up to a few kilometres.
 */

/** Mean Earth radius in metres used for all spherical calculations. */
const R = 6371000;

/** Converts decimal degrees to radians. */
const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Converts radians to decimal degrees. */
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Cap style for the corridor ends.
 * - `'round'` — semicircular arc centred on the endpoint.
 * - `'flat'`  — straight perpendicular edge exactly at the endpoint.
 */
export type LineCapStyle = 'round' | 'flat';

/**
 * Computes the destination point reached by travelling `distanceM` metres
 * from `origin` in direction `bearingRad`.
 *
 * Spherical direct problem:
 * ```
 * lat2 = asin( sin(lat1)*cos(d) + cos(lat1)*sin(d)*cos(b) )
 * lon2 = lon1 + atan2( sin(b)*sin(d)*cos(lat1), cos(d) - sin(lat1)*sin(lat2) )
 * ```
 * where `d = distanceM / R` (angular distance) and `b` = bearing.
 *
 * @param origin     Starting point as [lon, lat] in decimal degrees.
 * @param distanceM  Travel distance in metres.
 * @param bearingRad Bearing in radians, clockwise from north (0=N, pi/2=E, pi=S).
 * @returns          Destination point as [lon, lat] in decimal degrees.
 */
export function destinationPoint(
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
 * Spherical inverse problem:
 * ```
 * b = atan2( sin(dLon)*cos(lat2),
 *            cos(lat1)*sin(lat2) - sin(lat1)*cos(lat2)*cos(dLon) )
 * ```
 * Result is in (-pi, pi]. Positive = east of north, negative = west of north.
 *
 * @param pointA  Origin as [lon, lat] in decimal degrees.
 * @param pointB  Destination as [lon, lat] in decimal degrees.
 * @returns       Initial bearing in radians, clockwise from north.
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
 * Generates the interior points of a semicircular arc for a round corridor cap.
 *
 * Sweeps **counterclockwise** (decreasing bearing) by exactly pi radians (180°)
 * from `startBearingRad` to `startBearingRad - pi`. Start and end points are
 * excluded — they already exist in `rightSide` / `leftSide`.
 *
 * ### Why counterclockwise?
 * The ring travels forward along the right side, so the end cap must curve around
 * the forward tip of the last vertex:
 * - End cap: `lastBearing + pi/2` (right) → `lastBearing` (tip) → `lastBearing - pi/2` (left).
 * - Start cap: `firstBearing - pi/2` (left) → `firstBearing + pi` (back tip) → `firstBearing + pi/2` (right).
 *
 * A clockwise sweep would go around the backward side, creating a self-intersection.
 *
 * @param centre          Centre of the arc (the polyline endpoint).
 * @param distanceM       Arc radius in metres (= `bufferMeters`).
 * @param startBearingRad Bearing of the first arc point (radians, clockwise from north).
 * @param numPts          Number of arc segments (default 16 → 15 interior points).
 * @returns               Interior arc points as [lon, lat] pairs.
 */
function buildSemicircle(
	centre: [number, number],
	distanceM: number,
	startBearingRad: number,
	numPts = 16,
): [number, number][] {
	const points: [number, number][] = [];
	// ptIndex 1…numPts-1: exclude endpoints (already in rightSide / leftSide)
	for (let ptIndex = 1; ptIndex < numPts; ptIndex++) {
		const fraction = ptIndex / numPts;
		// Counterclockwise sweep: subtract fraction of pi from startBearing
		const ptBearing = startBearingRad - Math.PI * fraction;
		points.push(destinationPoint(centre, distanceM, ptBearing));
	}
	return points;
}

/**
 * Builds a closed corridor polygon around a polyline.
 *
 * ## Algorithm
 *
 * ### Step 1 — Per-vertex bearing
 * - **First vertex**: bearing toward the second point.
 * - **Last vertex**: bearing from the second-to-last point.
 * - **Interior vertices**: circular mean of incoming and outgoing bearings
 *   via `atan2(mean(sin), mean(cos))` to handle wrap-around correctly
 *   (e.g. 350° and 10° → 0°, not the erroneous 180° from plain average).
 *
 * ### Step 2 — Perpendicular offsets
 * Two offset points are computed per vertex at distance `bufferMeters`:
 * - **Right side**: `bearing + pi/2` (90° clockwise).
 * - **Left side**: `bearing - pi/2` (90° counter-clockwise).
 *
 * ### Step 3 — Ring assembly
 *
 * **Flat caps** (`capStyle = 'flat'`): straight perpendicular edge at both ends.
 * ```
 * leftSide[0]  <──────────────────  leftSide[n]
 *     |  (flat cap)        (flat cap)  |
 * rightSide[0]  ──────────────────>  rightSide[n]
 * ```
 *
 * **Round caps** (`capStyle = 'round'`, default): semicircular arcs at both ends.
 * ```
 * leftSide[0]  <──────────────────  leftSide[n]
 *    ╰──(start arc)          (end arc)──╯
 * rightSide[0]  ──────────────────>  rightSide[n]
 * ```
 * The arc radius equals `bufferMeters`, so all points within `bufferMeters`
 * of each endpoint are enclosed — matching circle-mode behaviour.
 *
 * @param coords       Ordered [lon, lat] vertices of the polyline (>= 2 required).
 *                     Fewer than 2 points returns an empty array.
 * @param bufferMeters Corridor **half-width** in metres. Total width = 2 x bufferMeters.
 * @param capStyle     End-cap style: `'round'` (default) or `'flat'`.
 * @returns            Closed ring of [lon, lat] pairs for a GeoJSON `Polygon` exterior ring.
 */
export function buildLineBufferPolygon(
	coords: [number, number][],
	bufferMeters: number,
	capStyle: LineCapStyle = 'round',
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
			// atan2(mean(sin), mean(cos)) handles the 0/2*pi wrap-around correctly.
			const bearing1 = bearing(coords[vertexIndex - 1], coords[vertexIndex]);
			const bearing2 = bearing(coords[vertexIndex], coords[vertexIndex + 1]);
			const sinAvg = (Math.sin(bearing1) + Math.sin(bearing2)) / 2;
			const cosAvg = (Math.cos(bearing1) + Math.cos(bearing2)) / 2;
			segBearing = Math.atan2(sinAvg, cosAvg);
		}

		// Right offset: 90° clockwise from forward bearing
		rightSide.push(destinationPoint(coords[vertexIndex], bufferMeters, segBearing + Math.PI / 2));
		// Left offset: 90° counter-clockwise from forward bearing
		leftSide.push(destinationPoint(coords[vertexIndex], bufferMeters, segBearing - Math.PI / 2));
	}

	const firstBearing = bearing(coords[0], coords[1]);
	const lastBearing  = bearing(coords[coords.length - 2], coords[coords.length - 1]);

	const ring: [number, number][] = [];

	if (capStyle === 'round') {
		ring.push(
			...rightSide,
			// End cap: counterclockwise sweep from right offset -> forward tip -> left offset
			...buildSemicircle(coords[coords.length - 1], bufferMeters, lastBearing + Math.PI / 2),
			...[...leftSide].reverse(),
			// Start cap: counterclockwise sweep from left offset -> backward tip -> right offset
			...buildSemicircle(coords[0], bufferMeters, firstBearing - Math.PI / 2),
		);
	} else {
		// Flat caps: direct straight connection at both ends (no arc points needed)
		ring.push(
			...rightSide,
			...[...leftSide].reverse(),
		);
	}

	// Close the ring by repeating the first vertex
	ring.push(ring[0]);

	return ring;
}

/**
 * Computes the geodetic (Haversine) great-circle distance in metres between two points.
 *
 * ```
 * a = sin²(dLat/2) + cos(lat1)*cos(lat2)*sin²(dLon/2)
 * d = R * 2 * atan2(sqrt(a), sqrt(1-a))
 * ```
 *
 * @param pointA  First point as [lon, lat] in decimal degrees.
 * @param pointB  Second point as [lon, lat] in decimal degrees.
 * @returns       Distance in metres.
 */
export function haversineDistance(pointA: [number, number], pointB: [number, number]): number {
	const dLat = toRad(pointB[1] - pointA[1]);
	const dLon = toRad(pointB[0] - pointA[0]);
	const lat1 = toRad(pointA[1]);
	const lat2 = toRad(pointB[1]);
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Generates a geodesic circle polygon around `center` with a given radius.
 *
 * Each vertex is placed using the spherical {@link destinationPoint} formula,
 * so the polygon accurately represents a circle of `radiusMeters` on the globe
 * — unlike a flat-earth approximation that distorts at high latitudes or large radii.
 *
 * Returns a **closed** ring (last point === first point) compatible with both
 * GeoJSON `Polygon` coordinates and deck.gl `PolygonLayer`.
 *
 * @param center       Circle centre as [lon, lat] in decimal degrees.
 * @param radiusMeters Radius in metres.
 * @param numPoints    Number of ring vertices before closing (default 64).
 * @returns            Closed ring of [lon, lat] pairs.
 */
export function buildCirclePolygon(
	center: [number, number],
	radiusMeters: number,
	numPoints = 64,
): [number, number][] {
	const ring: [number, number][] = Array.from({ length: numPoints }, (_, pointIndex) => {
		const bearingAngle = (2 * Math.PI * pointIndex) / numPoints;
		return destinationPoint(center, radiusMeters, bearingAngle);
	});
	// Close the ring
	ring.push(ring[0]);
	return ring;
}


