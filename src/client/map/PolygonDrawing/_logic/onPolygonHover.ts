import { PolygonClickInfo } from './polygonDrawingTypes';

interface OnHoverParams {
    info: PolygonClickInfo;
    setIsHoveringPoint: (isHovering: boolean) => void;
    setHoveredPointIndex: (index: number | null) => void;
}

/**
 * Detects if the cursor is hovering over a polygon vertex.
 * Used to update UI state for highlighting and cursor styling.
 */
export const onPolygonHover = ({ info, setIsHoveringPoint, setHoveredPointIndex }: OnHoverParams) => {
    const { layer, index } = info;

    // Check if the hovered object belongs to the 'vertex-layer' and has a valid index
    if (layer && layer.id && layer.id.includes('vertex-layer') && typeof index === 'number' && index >= 0) {
        setIsHoveringPoint(true);
        setHoveredPointIndex(index);
    } else {
        setIsHoveringPoint(false);
        setHoveredPointIndex(null);
    }
};

