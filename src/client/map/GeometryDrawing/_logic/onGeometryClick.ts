import { GeometryCoordinates, GeometryClickInfo, DrawingMode } from '../_types/geometryDrawingTypes';

interface OnClickParams {
	info: GeometryClickInfo;
	geometryCoordinates: GeometryCoordinates;
	isClosed: boolean;
	setGeometryCoordinates: (coords: GeometryCoordinates) => void;
	setIsClosed: (closed: boolean) => void;
	mode: DrawingMode;
	selectedPointIndex?: number | null;
	setSelectedPointIndex: (index: number | null) => void;
}

/**
 * Handles click events during drawing mode.
 *
 * - Click on a vertex (polygon/line) → select it for potential deletion (highlights red).
 *   Clicking the already-selected vertex deselects it.
 * - Click on edge-pick-layer → ignored on single click (double-click handles insertion).
 * - Click on first vertex when polygon is closeable → close the polygon.
 * - Click on empty map space → deselect any selected vertex, add new drawing point.
 */
export const onGeometryClick = ({
	info,
	geometryCoordinates,
	isClosed,
	setGeometryCoordinates,
	setIsClosed,
	mode,
	selectedPointIndex = null,
	setSelectedPointIndex,
}: OnClickParams) => {
	if (!info) return;

	const coordinate = info.coordinate;
	const clickedLayerId = info.sourceLayer?.id ?? info.layer?.id ?? '';
	const clickedIndex =
		typeof info.index === 'number'
			? info.index
			: typeof info.object?.index === 'number'
				? info.object.index
				: undefined;

	// ── Edge pick layer – ignore on single click (double-click handles insertion) ──
	if (clickedLayerId.includes('edge-pick-layer')) return;

	// ── Vertex click ──────────────────────────────────────────────────────────────
	if (clickedLayerId.includes('vertex-layer') && typeof clickedIndex === 'number') {
		// Polygon: clicking first vertex when closeable → close the loop.
		if (mode === 'polygon' && !isClosed && clickedIndex === 0 && geometryCoordinates.length >= 3) {
			setSelectedPointIndex(null);
			setIsClosed(true);
			return;
		}

		// Polygon/line: toggle vertex selection for deletion.
		// Circle has no vertex editing.
		if (mode !== 'circle') {
			if (selectedPointIndex === clickedIndex) {
				setSelectedPointIndex(null); // deselect if clicking same vertex
			} else {
				setSelectedPointIndex(clickedIndex);
			}
		}
		return;
	}

	// ── Click on empty space – deselect selected vertex (don't add point if closed) ──
	setSelectedPointIndex(null);

	if (isClosed) return;

	// ── Add new drawing point ──────────────────────────────────────────────────
	if (coordinate) {
		if (mode === 'circle') {
			const newCoords = [...geometryCoordinates, coordinate as [number, number]];
			setGeometryCoordinates(newCoords);
			if (newCoords.length === 2) setIsClosed(true);
		} else {
			setGeometryCoordinates([...geometryCoordinates, coordinate as [number, number]]);
		}
	}
};
