import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { PickingInfo, ViewStateChangeParameters, WebMercatorViewport } from '@deck.gl/core';
import { useSharedState } from '../../shared/hooks/state.useSharedState';
import { getMapByKey } from '../../shared/appState/selectors/getMapByKey';
import { MapView } from '../../shared/models/models.mapView';
import { StateActionType } from '../../shared/appState/enum.state.actionType';
import { getLayersByMapKey } from '../../shared/appState/selectors/getLayersByMapKey';
import { ActionMapViewChange } from '../../shared/appState/state.models.actions';
import { mergeViews } from '../logic/mapView/mergeViews';
import { getViewChange } from '../logic/mapView/getViewChange';
import { handleMapClick } from './handleMapClick';
import { handleMapHover } from './handleMapHover';
import { getMapTooltip } from './MapTooltip/getMapTooltip';
import { LayerInstance, LayerManager } from '../components/layers/LayerManager';
import { RenderingLayer } from '../../shared/models/models.layers';

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
 *
 * @param {BasicMapProps} props - The props for the map.
 * @returns {JSX.Element} DeckGL map component.
 */
export const SingleMap = ({ mapKey, syncedView, CustomTooltip = false }: BasicMapProps) => {
	const [sharedState, sharedStateDispatch] = useSharedState();
	const [controlIsDown, setControlIsDown] = useState(false);
	const [layerIsHovered, setLayerIsHovered] = useState(false);

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
	 * Handles click events on the map.
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
				controller={true}
				width="100%"
				height="100%"
				onViewStateChange={onViewStateChange}
				onClick={onClick}
				onHover={onHover}
				getCursor={({ isDragging }) => (isDragging ? 'grabbing' : layerIsHovered ? 'pointer' : 'grab')}
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
