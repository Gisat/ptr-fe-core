import { AppSharedState } from '../state.models';
import { MapView } from '../../models/models.mapView';

/**
 * Get map view by map key
 * @param state AppSharedState
 * @param key map key
 * @returns {MapView|null} map view
 */
export const getMapViewByKey = (state: AppSharedState, key: string): MapView | null => {
	const map = state?.maps?.find((map) => map.key === key);
	if (!map) {
		console.warn(`Map with key "${key}" not found.`);
		return null;
	}

	if (!map.view) {
		console.warn(`Map with key "${key}" does not have a view.`);
		return null;
	}

	return map.view;
};
