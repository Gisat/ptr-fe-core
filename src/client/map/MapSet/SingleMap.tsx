import { useEffect, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { LayersList, PickingInfo, ViewStateChangeParameters } from '@deck.gl/core';
import { useSharedState } from '../../shared/hooks/state.useSharedState';
import { getMapByKey } from '../../shared/appState/selectors/getMapByKey';
import { MapView } from '../../shared/models/models.mapView';
import { mergeViews } from '../../map/logic/mapView/mergeViews';
import { ActionMapViewChange } from '../../shared/appState/state.models.actions';
import { getViewChange } from '../../map/logic/mapView/getViewChange';
import { getLayersByMapKey } from '../../shared/appState/selectors/getLayersByMapKey';
import { parseLayersFromSharedState } from '../../map/logic/parsing.layers';
import { handleMapClick } from './handleMapClick';

export interface BasicMapProps {
	// map view state
	syncedView: Partial<MapView>;
	// map set identifier
	mapKey: string;
}

/**
 * SingleMap component intended to be used in MapSet component.
 *
 * Renders a DeckGL map instance with selection, hover, and view state sync logic.
 *
 * @param {BasicMapProps} props - The props for the map.
 * @param {string} props.mapKey - Map identifier.
 * @param {Partial<MapView>} props.syncedView - Part of map view state that is synced with other maps.
 * @returns {JSX.Element} DeckGL map component.
 */
export const SingleMap = ({ mapKey, syncedView }: BasicMapProps) => {
	const [sharedState, sharedStateDispatch] = useSharedState();
	const [layerIsHovered, setLayerIsHovered] = useState(false);
	const [controlIsDown, setControlIsDown] = useState(false);

	// Get the current map state and layers from shared state
	const mapState = getMapByKey(sharedState, mapKey);
	const mapViewState = mergeViews(syncedView, mapState?.view ?? {});
	const mapLayers = getLayersByMapKey(sharedState, mapKey);

	// On mount: sync the map view and set up keyboard listeners for Ctrl key
	useEffect(() => {
		sharedStateDispatch({
			type: 'mapViewChange',
			payload: { key: mapKey, viewChange: syncedView },
		} as ActionMapViewChange);

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Control') {
				setControlIsDown(true);
			}
		};
		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key === 'Control') {
				setControlIsDown(false);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
		};
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
				type: 'mapViewChange',
				payload: { key: mapKey, viewChange: change },
			} as ActionMapViewChange);
		}
	};

	// Parse layers for DeckGL rendering
	const layers: LayersList = mapLayers ? parseLayersFromSharedState(sharedState, [...mapLayers]) : [];

	return (
		<DeckGL
			viewState={mapViewState}
			layers={layers}
			controller={true}
			width="100%"
			height="100%"
			onViewStateChange={onViewStateChange}
			onClick={onClick}
			onHover={({ object }) => setLayerIsHovered(Boolean(object))}
			getCursor={({ isDragging }) => (isDragging ? 'grabbing' : layerIsHovered ? 'pointer' : 'grab')}
		/>
	);
};
