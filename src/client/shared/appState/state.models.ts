import { RenderingLayer } from '../models/models.layers';
import { ApplicationNode, PantherEntity, Period, Place, Style } from '../../../globals/shared/panther/models.nodes';
import { SingleMapModel } from '../models/models.singleMap';
import { MapSetModel } from '../models/models.mapSet';
import { Selection } from '../models/models.selections';

/**
 * Shared state of the application
 */
export interface AppSharedState {
	appNode: ApplicationNode; // context of the application from the backend
	layers: PantherEntity[]; // metadata of layers (TODO rename to layerTemplates & add specific type?)
	places: Place[]; // metadata of places
	renderingLayers: RenderingLayer[]; // backend layers in rendering context
	mapSets: MapSetModel[]; // map sets containing one or multiple synced or unsynced maps
	maps: SingleMapModel[]; // individual maps with defined view and list of layers to be rendered
	styles: Style[]; // metadata of styles
	periods: Period[]; // metadata of periods
	selections: Selection[]; // selections of features in layers
}
