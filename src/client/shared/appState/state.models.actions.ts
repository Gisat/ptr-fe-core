import { ApplicationNode, Datasource } from '../../../globals/shared/panther/models.nodes';
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
    | ActionSetApplicationNode
    | ActionLayerActiveChange
    | ActionMapLayerActiveChange
    | ActionMapLayerOpacityChange
    | ActionMapViewChange
    | ActionMapSetSyncChange
    | ActionGlobalStateUpdate
    | ActionApplyPersistentState;