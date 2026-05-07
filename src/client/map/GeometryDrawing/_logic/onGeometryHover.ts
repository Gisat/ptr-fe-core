import { GeometryClickInfo } from '../_types/geometryDrawingTypes';

interface OnHoverParams {
	info: GeometryClickInfo;
	setIsHoveringPoint: (isHovering: boolean) => void;
	setHoveredPointIndex: (index: number | null) => void;
	/** When true, also detects hover over edge-midpoint-layer ghosts. */
	isEditingPoints?: boolean;
	/** Called with the hovered edge index (or null) when isEditingPoints is true. */
	setHoveredEdgeIndex?: (index: number | null) => void;
}

/**
 * Detects if the cursor is hovering over a geometry vertex or (in edit mode) an edge midpoint.
 * Used to update UI state for highlighting and cursor styling.
 */
export const onGeometryHover = ({
	info,
	setIsHoveringPoint,
	setHoveredPointIndex,
	isEditingPoints = false,
	setHoveredEdgeIndex,
}: OnHoverParams) => {
	const { layer, index } = info;
	const layerId = layer?.id ?? '';

	// ── Edit mode: edge midpoint ghost ──────────────────────────────────────────
	if (isEditingPoints && layerId.includes('edge-midpoint-layer')) {
		setIsHoveringPoint(false);
		setHoveredPointIndex(null);
		const edgeIndex =
			typeof info.object?.edgeIndex === 'number' ? info.object.edgeIndex : null;
		setHoveredEdgeIndex?.(edgeIndex);
		return;
	}

	// ── Vertex handle ────────────────────────────────────────────────────────────
	if (layerId.includes('vertex-layer') && typeof index === 'number' && index >= 0) {
		setIsHoveringPoint(true);
		setHoveredPointIndex(index);
		setHoveredEdgeIndex?.(null);
	} else {
		setIsHoveringPoint(false);
		setHoveredPointIndex(null);
		setHoveredEdgeIndex?.(null);
	}
};
