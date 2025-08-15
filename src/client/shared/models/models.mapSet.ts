import { MapView } from '../models/models.mapView';

import { MapSetSync } from '../models/models.mapSetSync';

/**
 * MapSet state definition
 */
export interface MapSetModel {
	key: string;
	maps: string[];
	mode?: 'slider' | 'grid';
	sync: MapSetSync;
	view: Partial<MapView>;
}
