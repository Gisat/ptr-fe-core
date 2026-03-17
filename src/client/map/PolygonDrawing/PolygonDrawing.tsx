import React, { useState, cloneElement, Children, ReactElement, ReactNode } from 'react';
import { polygonLayer } from './_layers/polygonLayer';
import { onPolygonClick } from './_logic/onPolygonClick';
import { onPolygonDrag } from './_logic/onPolygonDrag';
import { onPolygonHover } from './_logic/onPolygonHover';
import { PolygonClickInfo, PolygonDragInfo, DrawingMode } from './_logic/polygonDrawingTypes';

interface PolygonDrawingProps {
	/** The map component to wrap */
	children: ReactElement;
	/** Current drawing mode – controlled from outside */
	mode: DrawingMode;
	/** Current polygon/circle coordinates – controlled from outside */
	polygonCoordinates: [number, number][];
	/** Whether the polygon loop is closed – controlled from outside */
	isClosed: boolean;
	/** Whether drawing/editing is active – controlled from outside */
	isActive: boolean;
	/** Called when coordinates change (vertex added, moved) */
	onPolygonChange: (coords: [number, number][]) => void;
	/** Called when closed state changes */
	onIsClosedChange: (closed: boolean) => void;
	/** Slot for app-level control buttons rendered inside the relative wrapper */
	controlsSlot?: ReactNode;
}

/**
 * Controlled component that allows drawing and editing a polygon/circle on a map.
 * Wraps a SingleMap and injects deck.gl layers + event handlers via cloneElement.
 *
 * mode / polygonCoordinates / isClosed / isActive are owned by the caller.
 * Only low-level interaction state (hover/drag) is managed internally.
 */
export const PolygonDrawing: React.FC<PolygonDrawingProps> = ({
	children,
	mode,
	polygonCoordinates,
	isClosed,
	isActive,
	onPolygonChange,
	onIsClosedChange,
	controlsSlot,
}) => {
	// Internal interaction state – not needed outside this component
	const [isHoveringPoint, setIsHoveringPoint] = useState(false);
	const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
	const [isDragging, setIsDragging] = useState(false);

	// Calculate the deck.gl layers to render based on current state
	const layers = polygonLayer({ polygonCoordinates, isClosed, isActive, hoveredPointIndex, mode });

	// Clone the child map component (SingleMap) and inject drawing props.
	// Uses the "external" prop convention supported by SingleMap.
	const mappedChildren = Children.map(children, (child) => {
		if (!React.isValidElement(child)) return child;

		return cloneElement(child as ReactElement<any>, {
			// Inject the generated deck.gl drawing layers on top of managed map layers
			extraLayers: layers,

			// Handle click events – add new vertex or close the polygon
			onClickExternal: (info: PolygonClickInfo) => {
				if (!isActive) return;
				onPolygonClick({
					info,
					polygonCoordinates,
					isClosed,
					setPolygonCoordinates: onPolygonChange,
					setIsClosed: onIsClosedChange,
					mode,
				});
			},

			// Handle drag events – move the dragged vertex in real time
			onDragExternal: (info: PolygonDragInfo) => {
				if (!isActive) return;
				onPolygonDrag({ info, polygonCoordinates, setPolygonCoordinates: onPolygonChange, mode });
			},

			// Handle hover events – detect when cursor is over a vertex
			onHoverExternal: (info: PolygonClickInfo) => {
				if (!isActive) return;
				onPolygonHover({ info, setIsHoveringPoint, setHoveredPointIndex });
			},

			// Mark drag as started only when hovering over a vertex
			onDragStartExternal: () => {
				if (isActive && isHoveringPoint) setIsDragging(true);
			},

			// Clear drag state when gesture ends
			onDragEndExternal: () => setIsDragging(false),

			// Dynamic cursor based on drawing / editing state
			getCursorExternal: ({ isDragging: _d }: { isDragging: boolean }) => {
				if (isDragging) return 'grabbing';              // vertex is being dragged
				if (isHoveringPoint && isActive) return 'pointer'; // hovering over a vertex
				if (isActive && !isClosed) return 'crosshair';    // drawing mode
				return 'default';
			},

			// Disable map pan/zoom while:
			//   - drawing an open polygon (always locked)
			//   - hovering over a vertex in edit mode (prevents race condition with DeckGL controller)
			//   - actively dragging a vertex
			controllerDisabled: isActive && (!isClosed || isHoveringPoint || isDragging),
		});
	});

	return (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			{mappedChildren}
			{controlsSlot}
		</div>
	);
};
