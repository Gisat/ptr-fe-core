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
const EARTH_RADIUS_METERS = 6371000;

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
	const distRad = distanceM / EARTH_RADIUS_METERS;
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
 * Normalises a bearing difference to the half-open interval (-π, π].
 * Required before using `delta` as a sweep angle so that clockwise and
 * counterclockwise turns are always unambiguous.
 */
function normaliseDelta(delta: number): number {
	let normalizedAngle = delta % (2 * Math.PI);
	if (normalizedAngle > Math.PI) normalizedAngle -= 2 * Math.PI;
	if (normalizedAngle <= -Math.PI) normalizedAngle += 2 * Math.PI;
	return normalizedAngle;
}

/**
 * Generates points along a circular arc centred on `centre`.
 *
 * The sweep direction and magnitude are encoded in `sweepRad`:
 * - positive → clockwise (increasing bearing)
 * - negative → counterclockwise (decreasing bearing)
 *
 * **Both endpoints are included** (`frac = 0` and `frac = 1`), giving
 * `numSegs + 1` points total. Callers that need only interior points
 * should use `.slice(1, -1)`.
 *
 * @param centre          Arc centre as [lon, lat] in decimal degrees.
 * @param distanceM       Arc radius in metres.
 * @param startBearingRad Bearing of the first arc point (radians, clockwise from north).
 * @param sweepRad        Signed total sweep angle in radians.
 * @param numSegs         Number of arc segments (numSegs+1 points returned).
 * @returns               Arc points as [lon, lat] pairs.
 */
function buildArc(
	centre: [number, number],
	distanceM: number,
	startBearingRad: number,
	sweepRad: number,
	numSegs: number,
): [number, number][] {
	const points: [number, number][] = [];
	for (let i = 0; i <= numSegs; i++) {
		const frac = i / numSegs;
		points.push(destinationPoint(centre, distanceM, startBearingRad + sweepRad * frac));
	}
	return points;
}

/** Arc segments per π radians at interior join arcs (8 → quarter-turn = 4 segs). */
const JOIN_SEGS_PER_PI = 8;

/** Arc segments for each end-cap semicircle. */
const CAP_SEGS = 16;

/**
 * Builds a closed corridor polygon around a polyline.
 *
 * ## Algorithm
 *
 * ### Step 1 — Per-segment bearings
 * Segment bearings are computed independently for each segment
 * (`bearing(Pi, Pi+1)`). Interior vertices do **not** average bearings —
 * averaging was the source of two bugs:
 * - **Miter spike**: the averaged bisector point is `bufferMeters / sin(α/2)`
 *   from the line, which grows to infinity at sharp turns.
 * - **180° reversal**: when incoming and outgoing bearings are exactly opposite,
 *   `sinAvg = cosAvg = 0`, so `atan2(0, 0)` returns an arbitrary bearing
 *   and the offset point is placed in the wrong direction entirely.
 *
 * ### Step 2 — Round joins at every interior vertex (both sides)
 * At each interior vertex `Pi`, **both** sides receive a circular arc of radius
 * `bufferMeters`, sweeping from the incoming offset bearing to the outgoing
 * offset bearing by `delta`:
 *
 * ```
 * delta = normalise(b_out - b_in)   // signed turn angle, in (-π, π]
 *
 * right arc: from (b_in + π/2)  sweeping delta  to (b_out + π/2)
 * left  arc: from (b_in - π/2)  sweeping delta  to (b_out - π/2)
 * ```
 *
 * This matches the `PathLayer` visual layer (`jointRounded: true`) exactly,
 * so the query polygon sent to the backend encloses the same area that the
 * user sees highlighted on screen — including all points near bent vertices
 * on the concave (interior) side.
 *
 * Arc density scales with the turn angle:
 * `numSegs = max(1, ceil(JOIN_SEGS_PER_PI × |delta| / π))`.
 *
 * ### Step 3 — Ring assembly
 *
 * **Flat caps** (`capStyle = 'flat'`): straight perpendicular edge at both ends.
 * ```
 * leftPoints[0]  <──────────────────  leftPoints[n]
 *      |  (flat cap)       (flat cap)  |
 * rightPoints[0]  ──────────────────>  rightPoints[n]
 * ```
 *
 * **Round caps** (`capStyle = 'round'`, default): semicircular arcs at both ends.
 * ```
 * leftPoints[0]  <──────────────────  leftPoints[n]
 *    ╰──(start arc)          (end arc)──╯
 * rightPoints[0]  ──────────────────>  rightPoints[n]
 * ```
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

	// ── Step 1: pre-compute all segment bearings ────────────────────────────────
	const segBearings: number[] = [];
	for (let i = 0; i < coords.length - 1; i++) {
		segBearings.push(bearing(coords[i], coords[i + 1]));
	}

	const firstBearing = segBearings[0];
	const lastBearing  = segBearings[segBearings.length - 1];

	// ── Step 2: build right and left offset point sequences ────────────────────
	const rightPoints: [number, number][] = [];
	const leftPoints:  [number, number][] = [];

	// First vertex — single offset point perpendicular to the first segment
	rightPoints.push(destinationPoint(coords[0], bufferMeters, firstBearing + Math.PI / 2));
	leftPoints.push( destinationPoint(coords[0], bufferMeters, firstBearing - Math.PI / 2));

	// Interior vertices — full arc on both sides, matching PathLayer's jointRounded:true visual.
	// This ensures the query polygon includes all points visible inside the corridor,
	// including those near the concave (interior) side of bent vertices.
	for (let i = 1; i < coords.length - 1; i++) {
		const bIn      = segBearings[i - 1];
		const bOut     = segBearings[i];
		const delta    = normaliseDelta(bOut - bIn);
		const absDelta = Math.abs(delta);

		if (absDelta < 1e-10) {
			// Essentially straight — single perpendicular offset point per side.
			rightPoints.push(destinationPoint(coords[i], bufferMeters, bIn + Math.PI / 2));
			leftPoints.push( destinationPoint(coords[i], bufferMeters, bIn - Math.PI / 2));
		} else {
			const numArcSegs = Math.max(1, Math.ceil(JOIN_SEGS_PER_PI * absDelta / Math.PI));
			rightPoints.push(...buildArc(coords[i], bufferMeters, bIn + Math.PI / 2, delta, numArcSegs));
			leftPoints.push( ...buildArc(coords[i], bufferMeters, bIn - Math.PI / 2, delta, numArcSegs));
		}
	}

	// Last vertex — single offset point perpendicular to the last segment
	rightPoints.push(destinationPoint(coords[coords.length - 1], bufferMeters, lastBearing + Math.PI / 2));
	leftPoints.push( destinationPoint(coords[coords.length - 1], bufferMeters, lastBearing - Math.PI / 2));

	// ── Step 3: assemble the ring ───────────────────────────────────────────────
	const ring: [number, number][] = [];

	if (capStyle === 'round') {
		// End cap: counterclockwise sweep (-π) from last right offset to last left offset.
		// slice(1, -1) excludes both endpoints — they are already the last element of
		// rightPoints and the first element of reversed leftPoints respectively.
		const endCapInterior = buildArc(
			coords[coords.length - 1], bufferMeters, lastBearing + Math.PI / 2, -Math.PI, CAP_SEGS,
		).slice(1, -1);

		// Start cap: counterclockwise sweep (-π) from first left offset to first right offset.
		const startCapInterior = buildArc(
			coords[0], bufferMeters, firstBearing - Math.PI / 2, -Math.PI, CAP_SEGS,
		).slice(1, -1);

		ring.push(
			...rightPoints,
			...endCapInterior,
			...[...leftPoints].reverse(),
			...startCapInterior,
		);
	} else {
		// Flat caps: straight edge at both ends, no arc points needed.
		ring.push(
			...rightPoints,
			...[...leftPoints].reverse(),
		);
	}

	// Close the ring
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
	const haversineCentralAngle =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(haversineCentralAngle), Math.sqrt(1 - haversineCentralAngle));
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

