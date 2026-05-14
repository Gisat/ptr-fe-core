import { GeometryClickInfo } from '../_types/geometryDrawingTypes';

interface OnHoverParams {
	info: GeometryClickInfo;
	setHoveredPointIndex: (index: number | null) => void;
	/**
	 * Called with a non-null sentinel (0) when hovering the edge-pick-layer,
	 * or null when leaving it. Drives the 'cell' cursor in SingleMap via isHoveringEdge.
	 */
	setHoveredEdgeIndex?: (index: number | null) => void;
}

/**
 * Detects if the cursor is hovering over a geometry vertex or the edge-pick-layer.
 * Used to update UI state for cursor styling and vertex highlighting.
 */
export const onGeometryHover = ({
	info,
	setHoveredPointIndex,
	setHoveredEdgeIndex,
}: OnHoverParams) => {
	const { layer, index } = info;
	const layerId = layer?.id ?? '';

	// ── Edge pick layer (transparent PathLayer on polygon edges) ─────────────────
	// Sets a non-null sentinel so SingleMap knows the cursor is over an edge
	// and can switch to the 'cell' cursor (hint: double-click to add a vertex).
	if (layerId.includes('edge-pick-layer')) {
		setHoveredPointIndex(null);
		setHoveredEdgeIndex?.(0); // sentinel – any non-null value signals "hovering edge"
		return;
	}

	// ── Vertex handle ────────────────────────────────────────────────────────────
	if (layerId.includes('vertex-layer') && typeof index === 'number' && index >= 0) {
		setHoveredPointIndex(index);
		setHoveredEdgeIndex?.(null);
	} else {
		setHoveredPointIndex(null);
		setHoveredEdgeIndex?.(null);
	}
};
