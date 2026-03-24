import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { PickingInfo, ViewStateChangeParameters, WebMercatorViewport } from '@deck.gl/core';
import { useSharedState } from '../../shared/hooks/state.useSharedState';
import { getMapByKey } from '../../shared/appState/selectors/getMapByKey';
import { MapView } from '../../shared/models/models.mapView';
import { StateActionType } from '../../shared/appState/enum.state.actionType';
import { getLayersByMapKey } from '../../shared/appState/selectors/getLayersByMapKey';
import { ActionMapViewChange, ActionPolygonDrawingUpdate } from '../../shared/appState/state.models.actions';
import { mergeViews } from '../logic/mapView/mergeViews';
import { getViewChange } from '../logic/mapView/getViewChange';
import { handleMapClick } from './handleMapClick';
import { handleMapHover } from './handleMapHover';
import { getMapTooltip } from './MapTooltip/getMapTooltip';
import { LayerInstance, LayerManager } from '../components/layers/LayerManager';
import { RenderingLayer, RenderingLayerPolygonDrawing } from '../../shared/models/models.layers';
import { onPolygonClick } from '../PolygonDrawing/_logic/onPolygonClick';
import { onPolygonDrag } from '../PolygonDrawing/_logic/onPolygonDrag';
import { onPolygonHover } from '../PolygonDrawing/_logic/onPolygonHover';

const TOOLTIP_VERTICAL_OFFSET_CURSOR_POINTER = -10;
const TOOLTIP_VERTICAL_OFFSET_CURSOR_GRABBER = -20;

export interface BasicMapProps {
	/** Map set identifier */
	mapKey: string;
	/** Map view state to sync with other maps */
	syncedView: Partial<MapView>;
	/** Custom tooltip component */
	CustomTooltip?: React.ElementType | boolean;
}

type LayerRegistry = Record<string, LayerInstance>;

/**
 * SingleMap component intended to be used in MapSet component.
 *
 * Renders a DeckGL map instance with selection, hover, and view state sync logic.
 * Polygon/circle drawing is handled automatically when a rendering layer with a
 * `polygonDrawing` field exists in the map's layer list – no extra props required.
 *
 * @param {BasicMapProps} props - The props for the map.
 * @returns {JSX.Element} DeckGL map component.
 */
export const SingleMap = ({
	mapKey,
	syncedView,
	CustomTooltip = false,
}: BasicMapProps) => {
	const [sharedState, sharedStateDispatch] = useSharedState();
	const [controlIsDown, setControlIsDown] = useState(false);
	const [layerIsHovered, setLayerIsHovered] = useState(false);
	// Local drag-gesture state used only for cursor styling during vertex drag
	const [isDragging, setIsDragging] = useState(false);
	/**
	 * Synchronous mirror of `isDragging`.
	 * useState has a 1-render lag – the ref is written inside the event handler
	 * itself so onHover sees the correct drag status in the same tick, preventing
	 * hover dispatches from racing with drag dispatches on fast circle movement.
	 */
	const isDraggingRef = React.useRef(false);

	// Ref + size are used only to compute a DeckGL Viewport instance that is
	// passed into LayerManager so selection tooltips in layer sources can
	// project [lng, lat] -> screen coordinates. DeckGL itself does not use this.
	const mapRef = React.useRef<HTMLDivElement>(null);
	const [mapSize, setMapSize] = useState<{ width: number; height: number } | null>(null);

	useEffect(() => {
		const node = mapRef.current;
		if (!node) return;

		// Observe size changes to the map container
		const updateSize = () => {
			const next = { width: node.offsetWidth, height: node.offsetHeight };
			setMapSize((prev) => (!prev || prev.width !== next.width || prev.height !== next.height ? next : prev));
		};

		// Initial size measurement
		updateSize();

		// Set up ResizeObserver to track size changes
		const resizeObserver = new window.ResizeObserver(updateSize);
		resizeObserver.observe(node);
		return () => resizeObserver.disconnect();
	}, []);

	/** Get the current map state and layers from shared state */
	const mapState = getMapByKey(sharedState, mapKey);
	const mapViewState = mergeViews(syncedView, mapState?.view ?? {});
	const mapLayers = getLayersByMapKey(sharedState, mapKey) ?? [];

	// ---------------------------------------------------------------------------
	// Drawing state – read automatically from the dedicated polygonDrawing layer.
	// Drawing is active when any layer in this map has polygonDrawing.isActive.
	// No extra props on MapSet or SingleMap are required – drawing activates purely
	// by the presence of a RenderingLayer with a `polygonDrawing` field in state.
	// ---------------------------------------------------------------------------
	const drawingLayer: RenderingLayer | undefined = mapLayers.find((l) => l.polygonDrawing);
	const drawingState: RenderingLayerPolygonDrawing | undefined = drawingLayer?.polygonDrawing;
	const isDrawingActive = drawingState?.isActive ?? false;
	/** True when the cursor is currently over a vertex handle */
	const isHoveringPoint = (drawingState?.hoveredPointIndex ?? null) !== null;

	/**
	 * Dispatches a partial patch to the drawing state of `drawingLayer`.
	 * No-op if there is no drawing layer in this map.
	 */
	const updateDrawing = useCallback(
		(patch: Partial<RenderingLayerPolygonDrawing>) => {
			if (!drawingLayer) return;
			sharedStateDispatch({
				type: StateActionType.POLYGON_DRAWING_UPDATE,
				payload: { layerKey: drawingLayer.key, patch },
			} as ActionPolygonDrawingUpdate);
		},
		[drawingLayer, sharedStateDispatch]
	);

	// Local registry for actual Deck.gl class instances
	const [layerRegistry, setLayerRegistry] = useState<LayerRegistry>({});

	const handleLayerUpdate = useCallback((id: string, instance: LayerInstance) => {
		setLayerRegistry((prev: LayerRegistry) => {
			if (prev[id] === instance) return prev; // Avoid unnecessary re-renders
			return { ...prev, [id]: instance };
		});
	}, []);

	// Filter and sort layers based on the order in mapLayers
	const activeLayers: LayerInstance[] = useMemo(() => {
		return mapLayers
			.map((layer: RenderingLayer) => layerRegistry[layer.key])
			.filter((layer: LayerInstance) => layer !== null && layer !== undefined);
	}, [mapLayers, layerRegistry]);

	/**
	 * On mount: sync the map view and set up keyboard listeners for Ctrl key.
	 */
	useEffect(() => {
		sharedStateDispatch({
			type: StateActionType.MAP_VIEW_CHANGE,
			payload: { key: mapKey, viewChange: syncedView },
		} as ActionMapViewChange);

		if (typeof window !== 'undefined') {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (event.key === 'Control') setControlIsDown(true);
			};
			const handleKeyUp = (event: KeyboardEvent) => {
				if (event.key === 'Control') setControlIsDown(false);
			};
			window.addEventListener('keydown', handleKeyDown);
			window.addEventListener('keyup', handleKeyUp);

			return () => {
				window.removeEventListener('keydown', handleKeyDown);
				window.removeEventListener('keyup', handleKeyUp);
			};
		}
	}, []);

	/**
	 * Internal selection click handler (only runs when drawing is NOT active).
	 *
	 * @param {PickingInfo} event - The DeckGL picking event containing information about the clicked object.
	 */
	const onClick = (event: PickingInfo) => {
		handleMapClick({
			event,
			sharedState,
			sharedStateDispatch,
			mapKey,
			controlIsDown,
			mapLayers,
		});
	};

	/**
	 * Handles hover events on the map.
	 *
	 * @param {PickingInfo} event - The DeckGL picking event containing information about the hovered object.
	 */
	const onHover = (event: PickingInfo) => {
		handleMapHover({
			event,
			mapLayers,
			setLayerIsHovered,
		});
	};

	/**
	 * Handles changes to the map view state (e.g., pan, zoom).
	 *
	 * @param {ViewStateChangeParameters} params - The parameters describing the view state change.
	 */
	const onViewStateChange = ({ viewState, oldViewState }: ViewStateChangeParameters) => {
		// Get changed view params
		const change = getViewChange(oldViewState, viewState);
		// Apply changes to map view if there are any
		if (Object.keys(change).length > 0) {
			sharedStateDispatch({
				type: StateActionType.MAP_VIEW_CHANGE,
				payload: { key: mapKey, viewChange: change },
			} as ActionMapViewChange);
		}
	};

	/** Tooltip vertical offset based on cursor style */
	const verticalOffset = layerIsHovered
		? TOOLTIP_VERTICAL_OFFSET_CURSOR_POINTER
		: TOOLTIP_VERTICAL_OFFSET_CURSOR_GRABBER;

	/**
	 * Memoized DeckGL viewport used by layer tooltips that need to project
	 * [lng, lat] coordinates to screen space (e.g. selection tooltips).
	 *
	 * - When `mapSize` is not yet known (null), viewport is null and selection
	 *   tooltips in layer sources will not be shown.
	 * - Once the map container is measured, viewport is created and passed
	 *   down to LayerManager.
	 */
	const viewport = useMemo(
		() =>
			mapSize
				? new WebMercatorViewport({
						...mapViewState,
						width: mapSize.width,
						height: mapSize.height,
					})
				: null,
		[mapViewState, mapSize]
	);

	return (
		<div className="ptr-SingleMap" ref={mapRef}>
			<LayerManager
				layers={mapLayers}
				onLayerUpdate={handleLayerUpdate}
				viewport={viewport}
				CustomTooltip={CustomTooltip}
			/>
			<DeckGL
				viewState={mapViewState}
				layers={activeLayers}
				/**
				 * Controller is disabled while drawing/editing so the user can click/drag
				 * vertices without accidentally panning or zooming the map.
				 */
				controller={!isDrawingActive}
				width="100%"
				height="100%"
				onViewStateChange={onViewStateChange}
				onClick={(event) => {
					if (isDrawingActive && drawingState) {
						// Drawing mode: handle vertex placement / polygon closing.
						// Return early to skip internal layer-selection logic.
						onPolygonClick({
							info: event as any,
							polygonCoordinates: drawingState.polygonCoordinates,
							isClosed: drawingState.isClosed,
							setPolygonCoordinates: (coords) => updateDrawing({ polygonCoordinates: coords }),
							setIsClosed: (closed) => updateDrawing({ isClosed: closed }),
							mode: drawingState.mode,
						});
						return; // skip internal selection
					}
					onClick(event);
				}}
				onHover={(event) => {
					// Always run internal hover so cursor / tooltip state stays correct
					onHover(event);
					if (isDrawingActive && drawingState) {
						onPolygonHover({
							info: event as any,
							setIsHoveringPoint: () => {},
							setHoveredPointIndex: (index) => {
								// Skip hover dispatches while dragging – prevents the pick result
								// oscillating (vertex ↔ null) from racing with drag dispatches.
								if (isDraggingRef.current) return;
								// Only dispatch when the value actually changes.
								if (index !== (drawingState.hoveredPointIndex ?? null)) {
									updateDrawing({ hoveredPointIndex: index });
								}
							},
						});
					}
				}}
				onDrag={(event) => {
					// Move the dragged vertex in real time
					if (isDrawingActive && drawingState) {
						onPolygonDrag({
							info: event as any,
							polygonCoordinates: drawingState.polygonCoordinates,
							setPolygonCoordinates: (coords) => updateDrawing({ polygonCoordinates: coords }),
							mode: drawingState.mode,
						});
					}
				}}
				onDragStart={() => {
					if (isDrawingActive) {
						// Always suppress hover dispatches for the entire drag in drawing mode.
						// isDraggingRef must not depend on isHoveringPoint (shared state) because
						// hoveredPointIndex may still be null when dragstart fires (the preceding
						// hover dispatch hasn't committed yet), leaving the ref unset and allowing
						// the hover/drag dispatch race that causes "Maximum update depth exceeded".
						isDraggingRef.current = true;
						// isDragging state is only for cursor styling – conditional is fine here.
						if (isHoveringPoint) setIsDragging(true);
					}
				}}
				onDragEnd={() => {
					setIsDragging(false);
					isDraggingRef.current = false;
				}}
				getCursor={({ isDragging: drag }) => {
					if (isDrawingActive) {
						if (drag || isDragging) return 'grabbing';      // vertex being dragged
						if (isHoveringPoint) return 'pointer';       // hovering over a vertex
						if (!drawingState?.isClosed) return 'crosshair'; // drawing mode
						return 'default';
					}
					// Default map cursor behaviour
					return drag ? 'grabbing' : layerIsHovered ? 'pointer' : 'grab';
				}}
				/**
				 * Default DeckGL tooltip:
				 * - Disabled when a CustomTooltip component is provided (layer sources
				 *   handle all tooltip rendering via getLayerTooltip in that case).
				 * - Otherwise, uses shared getMapTooltip for simple hover tooltips
				 *   based on picking info and layer configuration.
				 */
				getTooltip={(info) => {
					if (CustomTooltip) return null;
					return getMapTooltip({
						info,
						mapLayers,
						verticalOffset,
					});
				}}
			/>
		</div>
	);
};
