import { MapView } from '../models/models.mapView';

import { MapSetSync } from '../models/models.mapSetSync';

/**
 * MapSet state definition
 */
export interface MapSetModel {
	key: string;
	maps: string[];
	sync: MapSetSync;
	view: Partial<MapView>;
}
