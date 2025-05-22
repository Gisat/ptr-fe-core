import { MapView } from '../../../shared/models/models.mapView';

/**
 * Compare old and new map view and return the changed values
 * @param prevView previous map view
 * @param nextView new map view
 */
export const getViewChange = (prevView: Partial<MapView>, nextView: Partial<MapView>) => {
	const change: Partial<MapView> = {};

	if (prevView && prevView.zoom !== nextView.zoom) {
		change.zoom = nextView.zoom;
	}

	if (prevView && prevView.latitude !== nextView.latitude) {
		change.latitude = nextView.latitude;
	}

	if (prevView && prevView.longitude !== nextView.longitude) {
		change.longitude = nextView.longitude;
	}
	//TODO add other params
	return change;
};
