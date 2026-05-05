import { PolygonLayer, ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import { DrawingMode } from '../_types/geometryDrawingTypes';
import { buildLineBufferPolygon } from '../_logic/lineBufferHelpers';

interface GeometryLayerProps {
	geometryCoordinates: [number, number][];
	isClosed: boolean;
	isActive: boolean;
	hoveredPointIndex: number | null;
	mode: DrawingMode;
	/** Buffer half-width in metres – used only in 'line' mode */
	bufferMeters?: number;
}

/** Haversine great-circle distance in metres – used only for the radius value. */
function getDistance(coord1: [number, number], coord2: [number, number]): number {
	const toRad = (deg: number) => (deg * Math.PI) / 180;
	const R = 6371000;
	const dLat = toRad(coord2[1] - coord1[1]);
	const dLon = toRad(coord2[0] - coord1[0]);
	const lat1 = toRad(coord1[1]);
	const lat2 = toRad(coord2[1]);
	const haversinSum =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	return R * 2 * Math.atan2(Math.sqrt(haversinSum), Math.sqrt(1 - haversinSum));
}

/**
 * Computes a destination point given a start, distance (m) and bearing (rad).
 * Uses the same spherical formula as Haversine, so the result is always
 * exactly `distance` metres from `origin` by the Haversine metric.
 */
function destinationPoint(
	origin: [number, number],
	distance: number,
	bearing: number
): [number, number] {
	const R = 6371000;
	const distRad = distance / R;
	const lat1 = (origin[1] * Math.PI) / 180;
	const lon1 = (origin[0] * Math.PI) / 180;

	const lat2 = Math.asin(
		Math.sin(lat1) * Math.cos(distRad) + Math.cos(lat1) * Math.sin(distRad) * Math.cos(bearing)
	);
	const lon2 =
		lon1 +
		Math.atan2(
			Math.sin(bearing) * Math.sin(distRad) * Math.cos(lat1),
			Math.cos(distRad) - Math.sin(lat1) * Math.sin(lat2)
		);

	return [(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI];
}

/**
 * Generates a geodesic circle with `numPoints` vertices.
 * Because each vertex is placed using the same spherical formula as getDistance,
 * the edge point (coord[1]) will always sit exactly on the polygon boundary
 * regardless of zoom level or Mercator distortion.
 */
function generateCircle(
	center: [number, number],
	radius: number,
	numPoints = 64
): [number, number][] {
	return Array.from({ length: numPoints }, (_, pointIndex) => {
		const bearingAngle = (2 * Math.PI * pointIndex) / numPoints;
		return destinationPoint(center, radius, bearingAngle);
	});
}

/**
 * Generates deck.gl layers for displaying and editing a geometry (polygon or circle).
 */
export const geometryLayer = ({
	geometryCoordinates,
	isClosed,
	isActive,
	hoveredPointIndex,
	mode,
	bufferMeters = 0,
}: GeometryLayerProps) => {
	if (!geometryCoordinates) return [];

	const layers: any[] = [];

	if (mode === 'line') {
		// ── Corridor buffer polygon ─────────────────────────────────────────────
		if (bufferMeters > 0 && geometryCoordinates.length >= 2) {
			const corridorPolygon = buildLineBufferPolygon(geometryCoordinates, bufferMeters);
			layers.push(
				new PolygonLayer({
					id: 'line-buffer-layer',
					data: [{ polygon: corridorPolygon }],
					getPolygon: (_data: any) => _data.polygon,
					getFillColor: [0, 150, 255, 100],
					getLineColor: [0, 100, 255],
					pickable: false,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					updateTriggers: {
						getPolygon: [geometryCoordinates, bufferMeters],
					},
				})
			);
		}

		// ── Polyline path ───────────────────────────────────────────────────────
		if (geometryCoordinates.length >= 2) {
			layers.push(
				new PathLayer({
					id: 'line-path-layer',
					data: [{ path: geometryCoordinates }],
					getPath: (_data: any) => _data.path,
					getColor: [0, 180, 60],
					widthMinPixels: 2,
					pickable: false,
				})
			);
		}
	} else if (mode === 'circle') {
		// ── Circle fill ────────────────────────────────────────────────────────
		// Use PolygonLayer with a geodesic polygon instead of ScatterplotLayer.
		// ScatterplotLayer renders circles using a flat-earth Mercator approximation;
		// for large circles this causes the edge point to appear off the circle at
		// extreme zoom levels. The geodesic polygon uses the same spherical maths as
		// getDistance, so the edge vertex is guaranteed to sit on the boundary.
		if (isClosed && geometryCoordinates.length === 2) {
			const radius = getDistance(geometryCoordinates[0], geometryCoordinates[1]);
			const circlePolygon = generateCircle(geometryCoordinates[0], radius);
			layers.push(
				new PolygonLayer({
					id: 'circle-fill-layer',
					data: [{ polygon: circlePolygon }],
					getPolygon: (_data: any) => _data.polygon,
					getFillColor: [0, 150, 255, 100],
					getLineColor: [0, 100, 255],
					pickable: isActive,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 2,
					autoHighlight: isActive,
					highlightColor: [0, 0, 255, 100],
				})
			);
		}

		// ── Radius line ────────────────────────────────────────────────────────
		// Only shown while the user is actively drawing / editing (isActive).
		// Hidden when the circle is complete and editing mode is off.
		if (isActive && geometryCoordinates.length === 2) {
			layers.push(
				new PathLayer({
					id: 'circle-radius-line',
					data: [{ path: geometryCoordinates }],
					getPath: (_data: any) => _data.path,
					getColor: [0, 0, 0, 100],
					widthMinPixels: 1,
					pickable: false,
				})
			);
		}
	} else {
		// ── Polygon mode ────────────────────────────────────────────────────────
		// Filled polygon – rendered when the loop is closed.
		if (isClosed && geometryCoordinates.length >= 3) {
			layers.push(
				new PolygonLayer({
					id: 'polygon-fill-layer',
					data: [{ polygon: geometryCoordinates }],
					getPolygon: (_data: any) => _data.polygon,
					getFillColor: [0, 150, 255, 100],
					getLineColor: [0, 100, 255],
					pickable: isActive,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 2,
					autoHighlight: true,
					highlightColor: [0, 0, 255, 100],
				})
			);
		} else if (geometryCoordinates.length > 0) {
			// Open path – connects the vertices placed so far while drawing.
			layers.push(
				new PathLayer({
					id: 'polygon-path-layer',
					data: [{ path: geometryCoordinates }],
					getPath: (_data: any) => _data.path,
					getColor: [0, 0, 255],
					widthMinPixels: 2,
					pickable: false,
				})
			);
		}
	}

	// ── Vertex handles ─────────────────────────────────────────────────────────
	// Draggable points; first vertex highlighted red when polygon is closeable.
	if (isActive && geometryCoordinates.length > 0) {
		layers.push(
			new ScatterplotLayer({
				id: 'vertex-layer',
				data: geometryCoordinates.map((_coord, _index) => ({ position: _coord, index: _index })),
				getPosition: (_data: any) => _data.position,
				getRadius: 8,
				radiusUnits: 'pixels',
				getFillColor: (_data: any) => {
					if (_data.index === hoveredPointIndex) return [255, 255, 0];
					if (mode === 'polygon') {
						// Highlight first vertex red when loop is closeable (unclosed & > 2 points)
						return (_data.index === 0 && !isClosed && geometryCoordinates.length > 2)
							? [255, 0, 0]
							: [255, 255, 255];
					}
					return [255, 255, 255];
				},
				stroked: true,
				getLineColor: [0, 0, 0],
				lineWidthMinPixels: 1,
				radiusMinPixels: 5,
				pickable: true,
				autoHighlight: true,
				highlightColor: [255, 0, 0, 255],
				updateTriggers: {
					getFillColor: [isClosed, geometryCoordinates.length, hoveredPointIndex, mode],
				},
			})
		);
	}

	return layers;
};

