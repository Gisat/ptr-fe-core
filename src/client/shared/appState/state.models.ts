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
} from '../models/models.metadata.js';

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
	styles?: FullPantherEntityWithNeighboursAsProp[]; // metadata of styles (TODO for backward compatibility, remove when styles are fully migrated to datasources)
	periods: PeriodWithNeighbours[]; // metadata of periods
	selections: Selection[]; // selections of features in layers
}
