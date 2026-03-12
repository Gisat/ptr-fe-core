import React, { useState, cloneElement, Children, ReactElement } from 'react';
import { ControlButtons } from './ControlButtons';
import { polygonLayer } from './_layers/polygonLayer';
import { onPolygonClick } from './_logic/onPolygonClick';
import { onPolygonDrag } from './_logic/onPolygonDrag';
import { onPolygonHover } from './_logic/onPolygonHover';
import { PolygonClickInfo, PolygonDragInfo, DrawingMode } from './_logic/polygonDrawingTypes';

interface PolygonDrawingProps {
	/** The map component to wrap */
	children: ReactElement;
	/** Callback when the polygon coordinates change */
	onPolygonChange?: (polygon: [number, number][]) => void;
}

/**
 * Component that allows drawing and editing a polygon on a map.
 * Wraps a map component (like RenderingMap) and injects deck.gl layers and event handlers.
 */
export const PolygonDrawing: React.FC<PolygonDrawingProps> = ({children, onPolygonChange}) => {
	// State for the drawing mode
	const [mode, setMode] = useState<DrawingMode>('polygon');
	// State for the polygon vertices [longitude, latitude]
	const [polygonCoordinates, setPolygonCoordinates] = useState<[number, number][]>([]);
	// State to track if the polygon loop is closed
	const [isClosed, setIsClosed] = useState(false);
	// State to control if drawing/editing is enabled
	const [isActive, setIsActive] = useState(false);
	// State to track if the cursor is hovering over a vertex (for styling and drag initiation)
	const [isHoveringPoint, setIsHoveringPoint] = useState(false);
	// State to store the index of the vertex being hovered
	const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
	// State to track if a vertex is currently being dragged
	const [isDragging, setIsDragging] = useState(false);

	/**
	 * Updates the polygon coordinates and triggers the external callback.
	 */
	const handlePolygonUpdate = (coords: [number, number][]) => {
		setPolygonCoordinates(coords);
		if (onPolygonChange) {
			onPolygonChange(coords);
		}
	};

	const handleIsClosedUpdate = (closed: boolean) => {
		setIsClosed(closed);
		// Logic for what happens when polygon closes can be extended here
	};

	/**
	 * Resets the drawing state to start over.
	 */
	const handleClear = () => {
		setPolygonCoordinates([]);
		setIsClosed(false);
		setIsActive(true); // Automatically switch to drawing mode
		setIsHoveringPoint(false);
		setHoveredPointIndex(null);
		if (onPolygonChange) onPolygonChange([]);
	};

	const handleToggleActive = () => {
		setIsActive(!isActive);
	};

	// Calculate the deck.gl layers to render based on current state
	const layers = polygonLayer({
		polygonCoordinates,
		isClosed,
		isActive,
		hoveredPointIndex,
		mode
	});

	// Clone the child map component to inject necessary props for interaction
	const mappedChildren = Children.map(children, (child) => {
		if (!React.isValidElement(child)) return child;

		return cloneElement(child as ReactElement<any>, {
			// Inject the generated layers into the map
			layer: layers,

			// Handle click events on the map
			onClick: (info: PolygonClickInfo) => {
				// Ignore clicks if drawing/editing is disabled
				if (!isActive) return;

				onPolygonClick({
					info,
					polygonCoordinates,
					isClosed,
					setPolygonCoordinates: handlePolygonUpdate,
					setIsClosed: handleIsClosedUpdate,
					mode
				});
			},

			// Handle drag events (moving vertices)
			onDrag: (info: PolygonDragInfo) => {
				if (!isActive) return;
				onPolygonDrag({
					info,
					polygonCoordinates,
					setPolygonCoordinates: handlePolygonUpdate,
					mode
				});
			},

			// Handle hover events (detecting vertices)
			onHover: (info: PolygonClickInfo) => {
				if (!isActive) return;
				onPolygonHover({
					info,
					setIsHoveringPoint,
					setHoveredPointIndex
				});
			},

			// Handle start of a drag interaction
			onStartDragging: () => {
				// Only allow dragging if we are hovering over a point
				if (isActive && isHoveringPoint) {
					setIsDragging(true);
				}
			},

			// Handle end of a drag interaction
			onStopDragging: () => {
				setIsDragging(false);
			},

			// dynamic cursor styling based on state
			getCursor: ({isDragging}: { isDragging: boolean }) => {
				if (isDragging) return 'grabbing';
				if (isHoveringPoint && isActive) return 'pointer';
				if (isActive && !isClosed) return 'crosshair';
				return 'default';
			},

			// disable default map controls (pan/zoom) while drawing an open polygon or dragging a point
			disableControls: (isActive && !isClosed) || isDragging
		});
	});

	return (
		<div style={{position: 'relative', width: '100%', height: '100%'}}>
			{mappedChildren}
			<ControlButtons
				isClosed={isClosed}
				isActive={isActive}
				onClear={handleClear}
				onToggleActive={handleToggleActive}
				mode={mode}
				setMode={setMode}
			/>
		</div>
	);
};

