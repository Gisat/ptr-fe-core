import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { PickingInfo, ViewStateChangeParameters, WebMercatorViewport } from '@deck.gl/core';
import { useSharedState } from '../../shared/hooks/state.useSharedState';
import { getMapByKey } from '../../shared/appState/selectors/getMapByKey';
import { MapView } from '../../shared/models/models.mapView';
import { StateActionType } from '../../shared/appState/enum.state.actionType';
import { getLayersByMapKey } from '../../shared/appState/selectors/getLayersByMapKey';
import { ActionMapViewChange, ActionGeometryDrawingUpdate } from '../../shared/appState/state.models.actions';
import { mergeViews } from '../logic/mapView/mergeViews';
import { getViewChange } from '../logic/mapView/getViewChange';
import { handleMapClick } from './handleMapClick';
import { handleMapHover } from './handleMapHover';
import { getMapTooltip } from './MapTooltip/getMapTooltip';
import { LayerInstance, LayerManager } from '../components/layers/LayerManager';
import { RenderingLayer, GeometryDrawingModel } from '../../shared/models/models.layers';
import { onGeometryClick } from '../GeometryDrawing/_logic/onGeometryClick';
import { onGeometryDblClick } from '../GeometryDrawing/_logic/onGeometryDblClick';
import { onGeometryDrag } from '../GeometryDrawing/_logic/onGeometryDrag';
import { onGeometryHover } from '../GeometryDrawing/_logic/onGeometryHover';
import type { PointEditConfig } from '../GeometryDrawing/_types/geometryDrawingTypes';

const TOOLTIP_VERTICAL_OFFSET_CURSOR_POINTER = -10;
const TOOLTIP_VERTICAL_OFFSET_CURSOR_GRABBER = -20;

export interface BasicMapProps {
	/** Map set identifier */
	mapKey: string;
	/** Map view state to sync with other maps */
	syncedView: Partial<MapView>;
	/** Custom tooltip component */
	CustomTooltip?: React.ElementType | boolean;
	/**
	 * Optional keyboard key configuration for vertex editing.
	 * Defaults: deleteKey = 'Delete', deselectKey = 'Escape'.
	 */
	pointEditConfig?: PointEditConfig;
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
	                          pointEditConfig = {},
                          }: BasicMapProps) => {
	const { deleteKey = 'Delete', deselectKey = 'Escape' } = pointEditConfig;
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
	// Drawing state – read automatically from the dedicated geometryDrawing layer.
	// Drawing is active when any layer in this map has geometryDrawing.isActive.
	// No extra props on MapSet or SingleMap are required – drawing activates purely
	// by the presence of a RenderingLayer with a `geometryDrawing` field in state.
	// ---------------------------------------------------------------------------
	const drawingLayer: RenderingLayer | undefined = mapLayers.find((layer) => layer.geometryDrawing);
	const drawingState: GeometryDrawingModel | undefined = drawingLayer?.geometryDrawing;
	const isDrawingActive = drawingState?.isActive ?? false;
	/** True when the cursor is currently over a vertex handle */
	const isHoveringPoint = (drawingState?.hoveredPointIndex ?? null) !== null;
	/** True when the cursor is currently over a polygon edge via the edge-pick layer */
	const isHoveringEdge = (drawingState?.hoveredEdgeIndex ?? null) !== null;
	/** True when a vertex is selected for deletion */
	const hasSelectedPoint = (drawingState?.selectedPointIndex ?? null) !== null;

	/**
	 * Ref to the DeckGL instance.
	 * Used in the onDoubleClick handler to call `pickObject({ x, y })` and
	 * determine which layer (if any) was under the cursor at the time of the event.
	 * DeckGL does not expose a native onDoubleClick prop, so we use the wrapper div's
	 * onDoubleClick and pick manually through this ref.
	 */
	const deckRef = React.useRef<any>(null);

	/**
	 * Dispatches a partial patch to the drawing state of `drawingLayer`.
	 * No-op if there is no drawing layer in this map.
	 */
	const updateDrawing = useCallback(
		(patch: Partial<GeometryDrawingModel>) => {
			if (!drawingLayer) return;
			sharedStateDispatch({
				type: StateActionType.GEOMETRY_DRAWING_UPDATE,
				payload: { layerKey: drawingLayer.key, patch },
			} as ActionGeometryDrawingUpdate);
		},
		[drawingLayer, sharedStateDispatch]
	);

	// Local registry for actual Deck.gl class instances
	const [layerRegistry, setLayerRegistry] = useState<LayerRegistry>({});

	const handleLayerUpdate = useCallback((id: string, instance: LayerInstance) => {
		setLayerRegistry((prev: LayerRegistry) => {
			if (prev[id] === instance) return prev; // Avoid unnecessary re-renders
			return { ... prev, [id]: instance };
		});
	}, []);

	// Filter and sort layers based on the order in mapLayers
	const activeLayers: LayerInstance[] = useMemo(() => {
		return mapLayers
			.map((layer: RenderingLayer) => layerRegistry[layer.key])
			.filter((layer: LayerInstance) => layer !== null && layer !== undefined);
	}, [mapLayers, layerRegistry]);

	/**
	 * Ref that always mirrors the latest drawing-related state.
	 * Keyboard handlers read from this ref so they never close over a stale value,
	 * yet the event listeners don't need to be re-registered on every state change.
	 */
	const drawingRef = React.useRef({ drawingLayer, drawingState, isDrawingActive });
	// Assigned directly during render (not in an effect) so the ref is always
	// up-to-date before any event handler that fires in the same tick.
	drawingRef.current = { drawingLayer, drawingState, isDrawingActive };

	/**
	 * On mount: sync the initial map view.
	 * Kept strictly on mount (`[]`) so it does NOT re-run when drawing state changes,
	 * which would dispatch MAP_VIEW_CHANGE on every hover/click and create an infinite loop.
	 */
	useEffect(() => {
		sharedStateDispatch({
			type: StateActionType.MAP_VIEW_CHANGE,
			payload: { key: mapKey, viewChange: syncedView },
		} as ActionMapViewChange);
	}, []);

	/**
	 * Register keyboard listeners once (or when configurable keys change).
	 * Current drawing state is read via `drawingRef` so this effect never needs
	 * `drawingLayer` / `drawingState` in its dependency array.
	 */
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Control') setControlIsDown(true);

			// ── Vertex deletion / deselect ──────────────────────────────────────────
			const { drawingLayer: dl, drawingState: ds, isDrawingActive: active } = drawingRef.current;
			if (!active || !dl || !ds || ds.mode === 'circle') return;

			const selIdx = ds.selectedPointIndex ?? null;

			if (event.key === deleteKey && selIdx !== null) {
				const coords = ds.geometryCoordinates;
				// Minimum number of vertices the result must keep:
				//   polygon → 3 (triangle)  →  allow deletion when length > 3
				//   line    → 2 (one segment) →  allow deletion when length > 2
				const minResult = ds.mode === 'polygon' ? 3 : 2;
				if (coords.length <= minResult) return; // silent ignore – too few points
				const newCoords = coords.filter((_, i) => i !== selIdx);
				sharedStateDispatch({
					type: StateActionType.GEOMETRY_DRAWING_UPDATE,
					payload: {
						layerKey: dl.key,
						patch: { geometryCoordinates: newCoords, selectedPointIndex: null },
					},
				} as ActionGeometryDrawingUpdate);
			}

			if (event.key === deselectKey && selIdx !== null) {
				sharedStateDispatch({
					type: StateActionType.GEOMETRY_DRAWING_UPDATE,
					payload: {
						layerKey: dl.key,
						patch: { selectedPointIndex: null },
					},
				} as ActionGeometryDrawingUpdate);
			}
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
	}, [deleteKey, deselectKey]);

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
					... mapViewState,
					width: mapSize.width,
					height: mapSize.height,
				})
				: null,
		[mapViewState, mapSize]
	);

	return (
		<div
			className="ptr-SingleMap"
			ref={mapRef}
			onDoubleClick={(dblEvent) => {
				if (!isDrawingActive || !drawingState || drawingState.mode !== 'polygon') return;
				if (!deckRef.current) return;
				const rect = mapRef.current!.getBoundingClientRect();
				const clickX = dblEvent.clientX - rect.left;
				const clickY = dblEvent.clientY - rect.top;
				const picked = deckRef.current.pickObject?.({ x: clickX, y: clickY, radius: 10 });
				if (!picked) return;
				onGeometryDblClick({
					info: picked as any,
					geometryCoordinates: drawingState.geometryCoordinates,
					mode: drawingState.mode,
					isClosed: drawingState.isClosed,
					setGeometryCoordinates: (coords) => updateDrawing({ geometryCoordinates: coords }),
				});
			}}
		>
			<LayerManager
				layers={mapLayers}
				onLayerUpdate={handleLayerUpdate}
				viewport={viewport}
				CustomTooltip={CustomTooltip}
			/>
			<DeckGL
				ref={deckRef}
				viewState={mapViewState}
				layers={activeLayers}
				/**
				 * Controller is disabled while drawing so the user can click/drag
				 * vertices without accidentally panning or zooming the map.
				 */
				controller={!isDrawingActive}
				width="100%"
				height="100%"
				onViewStateChange={onViewStateChange}
				onClick={(event) => {
					if (isDrawingActive && drawingState) {
						onGeometryClick({
							info: event as any,
							geometryCoordinates: drawingState.geometryCoordinates,
							isClosed: drawingState.isClosed,
							setGeometryCoordinates: (coords) => updateDrawing({ geometryCoordinates: coords }),
							setIsClosed: (closed) => updateDrawing({ isClosed: closed }),
							mode: drawingState.mode,
							selectedPointIndex: drawingState.selectedPointIndex ?? null,
							setSelectedPointIndex: (selectedIndex) => updateDrawing({ selectedPointIndex: selectedIndex }),
						});
						return; // skip internal selection
					}
					onClick(event);
				}}
				onHover={(event) => {
					// Always run internal hover so cursor / tooltip state stays correct
					onHover(event);
					if (isDrawingActive && drawingState) {
						onGeometryHover({
							info: event as any,
							setHoveredPointIndex: (index) => {
								if (isDraggingRef.current) return;
								if (index !== (drawingState.hoveredPointIndex ?? null)) {
									updateDrawing({ hoveredPointIndex: index });
								}
							},
							setHoveredEdgeIndex: (index) => {
								if (isDraggingRef.current) return;
								if (index !== (drawingState.hoveredEdgeIndex ?? null)) {
									updateDrawing({ hoveredEdgeIndex: index });
								}
							},
						});
					}
				}}
				onDrag={(event) => {
					// In edit mode drag is intentionally left to the map controller (pan/zoom).
					// Move the dragged vertex in real time only in drawing mode.
					if (isDrawingActive && drawingState) {
						onGeometryDrag({
							info: event as any,
							geometryCoordinates: drawingState.geometryCoordinates,
							setGeometryCoordinates: (coords) => updateDrawing({ geometryCoordinates: coords }),
							mode: drawingState.mode,
						});
					}
				}}
				onDragStart={() => {
					if (isDrawingActive) {
						isDraggingRef.current = true;
						if (isHoveringPoint) setIsDragging(true);
					}
				}}
				onDragEnd={() => {
					setIsDragging(false);
					isDraggingRef.current = false;
				}}
				getCursor={({ isDragging: drag }) => {
					if (isDrawingActive) {
						if (drag || isDragging) return 'grabbing';                       // vertex being dragged
						if (isHoveringEdge) return 'cell';                              // + add vertex on dblclick
						if (hasSelectedPoint && isHoveringPoint) return 'not-allowed';  // selected vertex
						if (isHoveringPoint) return 'pointer';                          // hoverable vertex
						if (!drawingState?.isClosed) return 'crosshair';                // drawing new point
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
					}) as any;
				}}
			/>
		</div>
	);
};

