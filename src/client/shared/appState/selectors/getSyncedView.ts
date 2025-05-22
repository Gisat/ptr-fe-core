import { AppSharedState } from '../state.models';
import { getMapSetByKey } from './getMapSetByKey';
import { MapView } from '../../models/models.mapView';

/**
 * Get a view part which is synced with other maps
 * @param state app shared state
 * @param key map set identifier
 * @returns view part which is synced with other maps
 */
export const getSyncedView = (state: AppSharedState, key: string): Partial<MapView> => {
	const mapSet = getMapSetByKey(state, key);
	const syncedView: Partial<MapView> = {};
	if (mapSet?.sync?.zoom) {
		syncedView.zoom = mapSet.view?.zoom;
	}
	if (mapSet?.sync?.center) {
		syncedView.latitude = mapSet.view?.latitude;
		syncedView.longitude = mapSet.view?.longitude;
	}
	return syncedView;
};
