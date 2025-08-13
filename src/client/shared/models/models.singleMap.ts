import { MapView } from './models.mapView';
import { RenderingLayer } from './models.layers';

/**
 * Map state definition
 */
export interface SingleMapModel {
	key: string;
	view: MapView;
	renderingLayers: Partial<RenderingLayer>[];
}
