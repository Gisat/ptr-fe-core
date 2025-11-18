import { RenderingLayer } from '../models/models.layers';
import { SingleMapModel } from '../models/models.singleMap';
import { MapSetModel } from '../models/models.mapSet';
import { Selection } from '../models/models.selections';
import {
	ApplicationNodeWithNeighbours,
	FullPantherEntityWithNeighboursAsProp,
	PantherEntityWithNeighbours,
	PeriodWithNeighbours,
	PlaceWithNeighbours,
} from '../models/models.metadata';

/**
 * Shared state of the application
 */
export interface AppSharedState {
	appNode: ApplicationNodeWithNeighbours; // context of the application from the backend
	layers: PantherEntityWithNeighbours[]; // metadata of layers (TODO rename to layerTemplates & add specific type?)
	places: PlaceWithNeighbours[]; // metadata of places
	renderingLayers: RenderingLayer[]; // backend layers in rendering context
	mapSets: MapSetModel[]; // map sets containing one or multiple synced or unsynced maps
	maps: SingleMapModel[]; // individual maps with defined view and list of layers to be rendered
	/**
	 * @deprecated This property is for backward compatibility and will be removed in a future release (target: Q4 2024).
	 * Please migrate to using datasources for styles metadata.
	 */
	styles?: FullPantherEntityWithNeighboursAsProp[];
	periods: PeriodWithNeighbours[]; // metadata of periods
	selections: Selection[]; // selections of features in layers
}
