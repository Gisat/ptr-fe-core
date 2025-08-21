import { AppSharedState } from '../state.models';
import { ActionMapViewChange } from '../../appState/state.models.actions';
import { getMapSetByMapKey } from '../../appState/selectors/getMapSetByMapKey';
import { MapView } from '../../models/models.mapView';
import { SingleMapModel } from '../../models/models.singleMap';
import { MapSetModel } from '../../models/models.mapSet';
import { getMapByKey } from '../../appState/selectors/getMapByKey';

/**
 * Handler for map view change action, specifically for maps in a map set.
 * @param state AppSharedState
 * @param action ActionMapViewChange
 * @returns Updated AppSharedState
 */
export const reduceHandlerMapSetMapViewChange = <T extends AppSharedState = AppSharedState>(
	state: T,
	action: ActionMapViewChange
): T => {
	const { payload } = action;

	if (!payload) throw new Error('No payload provided for map view change action');
	const { key: mapKey, viewChange } = payload;

	// Find the map and its parent map set
	const mapToChange = getMapByKey(state, mapKey);
	if (!mapToChange) throw new Error(`Map with key ${mapKey} not found`);

	const parentMapSet = getMapSetByMapKey(state, mapKey);
	if (!parentMapSet) throw new Error(`Parent MapSet for map with key ${mapKey} not found`);

	// Initialize changes for map and map set views
	const thisMapViewChange: Partial<MapView> = {};
	const otherMapsViewChange: Partial<MapView> = {};
	const mapSetViewChange: Partial<MapView> = {};

	// Extract view change parameters
	const { zoom, latitude, longitude } = viewChange;
	const { zoom: zoomSync, center: centerSync } = parentMapSet.sync;

	// Handle zoom change
	if (zoom) {
		if (zoomSync) {
			// Sync zoom for all maps in the map set
			mapSetViewChange.zoom = zoom;
			otherMapsViewChange.zoom = zoom;
		}
		thisMapViewChange.zoom = zoom;
	}

	// Handle latitude change
	if (latitude !== undefined) {
		if (centerSync) {
			// Sync latitude for all maps in the map set
			mapSetViewChange.latitude = latitude;
			otherMapsViewChange.latitude = latitude;
		}
		thisMapViewChange.latitude = latitude;
	}

	// Handle longitude change
	if (longitude !== undefined) {
		if (centerSync) {
			// Sync longitude for all maps in the map set
			mapSetViewChange.longitude = longitude;
			otherMapsViewChange.longitude = longitude;
		}
		thisMapViewChange.longitude = longitude;
	}

	// Update map set view (for synced parameters)
	const updatedMapSets: MapSetModel[] = state.mapSets.map((mapSet: MapSetModel) => {
		const isChangeInMapSetView = Object.keys(mapSetViewChange).length !== 0;
		if (isChangeInMapSetView && mapSet.key === parentMapSet.key) {
			// If the map set is the one being changed, update its view
			return { ...mapSet, view: { ...mapSet.view, ...mapSetViewChange } };
		} else {
			// Otherwise, return the map set unchanged
			return mapSet;
		}
	});

	// Update all maps in map set view
	const updatedMaps: SingleMapModel[] = state.maps.map((map: SingleMapModel) => {
		const isChangeInOtherMapView = Object.keys(otherMapsViewChange).length !== 0;
		const isMapPartOfCurrentMapSet = parentMapSet.maps.includes(map.key);

		if (map.key === mapKey) {
			// Update the map that triggered the change
			return { ...map, view: { ...map.view, ...thisMapViewChange } };
		} else if (map.key !== mapKey && isMapPartOfCurrentMapSet && isChangeInOtherMapView) {
			// Update other maps in the map set, if there was a change
			return { ...map, view: { ...map.view, ...otherMapsViewChange } };
		} else {
			// Return unchanged map
			return map;
		}
	});

	// Return the updated state
	return { ...state, maps: updatedMaps, mapSets: updatedMapSets };
};
