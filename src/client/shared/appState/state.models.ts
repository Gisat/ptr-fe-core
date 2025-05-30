import { RenderingLayer } from '../models/models.layers';
import {
	ApplicationNode,
	PantherEntity
} from '../../../globals/shared/panther/models.nodes';
import { SingleMapModel } from '../models/models.singleMap';
import { MapSetModel } from '../models/models.mapSet';

/**
 * Shared state of the application
 */
export interface AppSharedState {
	appNode: ApplicationNode; // context of the application from the backend
	layers: PantherEntity[]; // metadata of layers (TODO rename to layerTemplates & add specific type?)
	renderingLayers: RenderingLayer[]; // backend layers in rendering context
	mapSets: MapSetModel[]; // map sets containing one or multiple synced or unsynced maps
	maps: SingleMapModel[]; // individual maps with defined view and list of layers to be rendered
}
