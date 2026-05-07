import { GeometryCoordinates, GeometryClickInfo, DrawingMode } from '../_types/geometryDrawingTypes';

interface OnDblClickParams {
	info: GeometryClickInfo;
	geometryCoordinates: GeometryCoordinates;
	mode: DrawingMode;
	isClosed: boolean;
	setGeometryCoordinates: (coords: GeometryCoordinates) => void;
}

/**
 * Returns the squared planar distance from point P to segment [A, B].
 * Works in geographic degrees – sufficient for finding the nearest edge
 * since we only need relative comparisons, not true distances.
 */
function pointToSegmentDistSq(
	point: [number, number],
	segmentA: [number, number],
	segmentB: [number, number],
): number {
	const dx = segmentB[0] - segmentA[0];
	const dy = segmentB[1] - segmentA[1];
	const lenSq = dx * dx + dy * dy;
	if (lenSq === 0) return (point[0] - segmentA[0]) ** 2 + (point[1] - segmentA[1]) ** 2;
	const projectionParam = Math.max(0, Math.min(1, ((point[0] - segmentA[0]) * dx + (point[1] - segmentA[1]) * dy) / lenSq));
	return (point[0] - segmentA[0] - projectionParam * dx) ** 2 + (point[1] - segmentA[1] - projectionParam * dy) ** 2;
}

/**
 * Handles double-click on the transparent edge-pick-layer.
 *
 * Finds the edge closest to the clicked coordinate (segment-distance search)
 * and splices a new vertex in at that position. No ghost markers needed –
 * the user double-clicks directly on the visible edge line.
 *
 * Only active for polygon mode (other modes ignored).
 */
export const onGeometryDblClick = ({
	info,
	geometryCoordinates,
	mode,
	isClosed,
	setGeometryCoordinates,
}: OnDblClickParams): void => {
	if (!info || mode !== 'polygon') return;

	const clickedLayerId = info.sourceLayer?.id ?? info.layer?.id ?? '';
	if (!clickedLayerId.includes('edge-pick-layer')) return;

	const clickedCoordinate = info.coordinate as [number, number] | undefined;
	if (!clickedCoordinate) return;

	const vertexCount = geometryCoordinates.length;
	const edgeCount = mode === 'polygon' && isClosed ? vertexCount : vertexCount - 1;

	let nearestEdgeIndex = 0;
	let minDistSq = Infinity;

	for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
		const segmentA = geometryCoordinates[edgeIndex];
		const segmentB = geometryCoordinates[(edgeIndex + 1) % vertexCount];
		const distSq = pointToSegmentDistSq(clickedCoordinate, segmentA, segmentB);
		if (distSq < minDistSq) {
			minDistSq = distSq;
			nearestEdgeIndex = edgeIndex;
		}
	}

	const newCoords = [...geometryCoordinates];
	newCoords.splice(nearestEdgeIndex + 1, 0, clickedCoordinate);
	setGeometryCoordinates(newCoords);
};
