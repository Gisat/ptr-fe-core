import { GeometryCoordinates, GeometryClickInfo, DrawingMode } from '../_types/geometryDrawingTypes';

interface OnEditPointsClickParams {
	info: GeometryClickInfo;
	geometryCoordinates: GeometryCoordinates;
	mode: DrawingMode;
	setGeometryCoordinates: (coords: GeometryCoordinates) => void;
}

/**
 * Handles click events when "Edit Points" mode is active.
 *
 * - Click on vertex  → delete that vertex (silent no-op if result would fall below minimum).
 * - Click on edge midpoint → insert a new vertex at the clicked coordinate.
 *
 * Minimum sizes (after deletion):
 *  - polygon: 3 vertices  → only delete when current length > 3
 *  - line:    2 vertices  → only delete when current length > 2
 */
export const onEditPointsClick = ({
	info,
	geometryCoordinates,
	mode,
	setGeometryCoordinates,
}: OnEditPointsClickParams) => {
	if (!info) return;

	const clickedLayerId = info.sourceLayer?.id ?? info.layer?.id ?? '';

	const clickedIndex =
		typeof info.index === 'number'
			? info.index
			: typeof info.object?.index === 'number'
				? info.object.index
				: undefined;

	const edgeIndex =
		typeof info.object?.edgeIndex === 'number' ? info.object.edgeIndex : undefined;

	// ── Delete vertex ────────────────────────────────────────────────────────────
	if (clickedLayerId.includes('vertex-layer') && typeof clickedIndex === 'number') {
		const minLength = mode === 'polygon' ? 4 : 3; // result must stay >= min-1
		if (geometryCoordinates.length <= minLength) return; // silent ignore
		const newCoords = geometryCoordinates.filter((_, i) => i !== clickedIndex);
		setGeometryCoordinates(newCoords);
		return;
	}

	// ── Insert vertex on edge midpoint ──────────────────────────────────────────
	if (clickedLayerId.includes('edge-midpoint-layer') && typeof edgeIndex === 'number') {
		const coord = info.coordinate as [number, number];
		if (!coord) return;
		const newCoords = [...geometryCoordinates];
		newCoords.splice(edgeIndex + 1, 0, coord);
		setGeometryCoordinates(newCoords);
		return;
	}
};

