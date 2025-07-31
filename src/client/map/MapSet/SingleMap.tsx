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
 * SingleMap component intended to be used in MapSet component
 * @param mapKey - map identifier
 * @param syncedView - part of map view state that is synced with other maps
 * @returns {JSX.Element} Deck GL map component
 */
export const SingleMap = ({ mapKey, syncedView }: BasicMapProps) => {
	const [sharedState, sharedStateDispatch] = useSharedState();
	const [layerIsHovered, setLayerIsHovered] = useState(false);
	const [controlIsDown, setControlIsDown] = useState(false);

	const mapState = getMapByKey(sharedState, mapKey);
	const mapViewState = mergeViews(syncedView, mapState?.view ?? {});
	const mapLayers = getLayersByMapKey(sharedState, mapKey);

	// Set the synced part of the map view state on component mount
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

	const onViewStateChange = ({ viewState, oldViewState }: ViewStateChangeParameters) => {
		// Get changed view params
		const change = getViewChange(oldViewState, viewState);
		// Apply changes to map view
		if (Object.keys(change).length > 0) {
			sharedStateDispatch({
				type: 'mapViewChange',
				payload: { key: mapKey, viewChange: change },
			} as ActionMapViewChange);
		}
	};

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
