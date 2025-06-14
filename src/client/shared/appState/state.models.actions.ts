import {
	ApplicationNode,
	Datasource,
	PantherEntity,
	Period,
	Place,
	Style,
} from '../../../globals/shared/panther/models.nodes';
import { SingleMapModel } from '../models/models.singleMap';
import { MapView } from '../models/models.mapView';
import { MapSetModel } from '../models/models.mapSet';
import { MapSetSync } from '../models/models.mapSetSync';
import { RenderingLayer } from '../models/models.layers';
import { StateActionType } from './enum.state.actionType'; // Import the ActionType enum

/**
 * When we set up application node
 */
export interface ActionSetApplicationNode {
	type: StateActionType.APP_NODE;
	payload: ApplicationNode;
}

/**
 * When we set up metadata datasources
 */
export interface ActionChangeLayerSources {
	type: StateActionType.FETCH_SOURCES;
	payload: Datasource[];
}

/**
 * When we set up layer metadata
 */
export interface ActionChangeLayers {
	type: StateActionType.FETCH_LAYERS;
	payload: PantherEntity[];
}

/**
 * When we set up place metadata
 */
export interface ActionChangePlaces {
	type: StateActionType.FETCH_PLACES;
	payload: Place[];
}

/**
 * When we set up period metadata
 */
export interface ActionChangePeriods {
	type: StateActionType.FETCH_PERIODS;
	payload: Period[];
}

/**
 * When we set up style metadata
 */
export interface ActionChangeStyles {
	type: StateActionType.FETCH_STYLES;
	payload: Style[];
}

/**
 * Activate or deactivate layer in render and status
 */
export interface ActionLayerActiveChange {
	type: StateActionType.LAYER_ACTIVE_CHANGE;
	payload: { key: string; newValue: boolean };
}

/**
 * Activate or deactivate layer in map
 */
export interface ActionMapLayerActiveChange {
	type: StateActionType.MAP_LAYER_ACTIVE_CHANGE;
	payload: { mapKey: string; layerKey: string; isActive: boolean };
}

/**
 * Change map layer opacity
 */
export interface ActionMapLayerOpacityChange {
	type: StateActionType.MAP_LAYER_OPACITY_CHANGE;
	payload: { mapKey: string; layerKey: string; opacity: number };
}

/**
 * Add layer to map
 */
export interface ActionMapLayerAdd {
	type: StateActionType.MAP_LAYER_ADD;
	payload: { mapKey: string; layer: Partial<RenderingLayer>; index?: number };
}

/**
 * Add map to map set
 */
export interface ActionMapAddToMapSet {
	type: StateActionType.MAP_ADD_TO_MAP_SET;
	payload: { mapSetKey: string; map: SingleMapModel };
}

/**
 * Remove map from map set
 */
export interface ActionMapRemoveFromMapSet {
	type: StateActionType.MAP_REMOVE_FROM_MAP_SET;
	payload: { mapSetKey: string; mapKey: string };
}

/**
 * Remove maps from map set by keys
 */
export interface ActionMapSetRemoveMapsByKeys {
	type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS;
	payload: { mapSetKey: string; mapKeys: string[] };
}

/**
 * Update state with data
 */
export interface ActionGlobalStateUpdate {
	type: StateActionType.GLOBAL_STATE_UPDATE;
	payload: { mapSets: MapSetModel[]; maps: SingleMapModel[]; renderingLayers: RenderingLayer[] };
}

/**
 * Apply persistent state
 * TODO add payload params
 */
export interface ActionApplyPersistentState {
	type: StateActionType.APPLY_PERSISTENT_STATE;
	payload: { mapSets: MapSetModel[]; maps: SingleMapModel[]; renderingLayers: RenderingLayer[] };
}

/**
 * Change map view
 */
export interface ActionMapViewChange {
	type: StateActionType.MAP_VIEW_CHANGE;
	payload: { key: string; viewChange: Partial<MapView> };
}

/**
 * Change map set sync
 */
export interface ActionMapSetSyncChange {
	type: StateActionType.MAP_SET_SYNC_CHANGE;
	payload: { key: string; syncChange: Partial<MapSetSync> };
}

/**
 * One of any of possible actions
 */
export type OneOfStateActions =
	| ActionChangeLayerSources
	| ActionChangeLayers
	| ActionChangePlaces
	| ActionChangeStyles
	| ActionChangePeriods
	| ActionSetApplicationNode
	| ActionLayerActiveChange
	| ActionMapAddToMapSet
	| ActionMapRemoveFromMapSet
	| ActionMapSetRemoveMapsByKeys
	| ActionMapLayerActiveChange
	| ActionMapLayerAdd
	| ActionMapLayerOpacityChange
	| ActionMapViewChange
	| ActionMapSetSyncChange
	| ActionGlobalStateUpdate
	| ActionApplyPersistentState;
