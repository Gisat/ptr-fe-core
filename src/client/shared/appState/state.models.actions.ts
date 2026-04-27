import { SingleMapModel } from '../models/models.singleMap';
import { MapView } from '../models/models.mapView';
import { MapSetModel } from '../models/models.mapSet';
import { MapSetSync } from '../models/models.mapSetSync';
import { RenderingLayer, GeometryDrawingModel } from '../models/models.layers';
import { StateActionType } from './enum.state.actionType'; // Import the ActionType enum
import { AppSpecificAction } from './state.models.reducer';
import { Selection } from '../models/models.selections';
import {
	ApplicationNodeWithNeighbours,
	DatasourceWithNeighbours,
	FullPantherEntityWithNeighboursAsProp,
	PantherEntityWithNeighbours,
	PeriodWithNeighbours,
	PlaceWithNeighbours,
} from '../models/models.metadata';

/**
 * When we set up application node
 */
export interface ActionSetApplicationNode extends AppSpecificAction {
	type: StateActionType.APP_NODE;
	payload: ApplicationNodeWithNeighbours;
}

/**
 * When we set up metadata datasources
 */
export interface ActionChangeLayerSources extends AppSpecificAction {
	type: StateActionType.FETCH_SOURCES;
	payload: DatasourceWithNeighbours[];
}

/**
 * When we set up layer metadata
 */
export interface ActionChangeLayers extends AppSpecificAction {
	type: StateActionType.FETCH_LAYERS;
	payload: PantherEntityWithNeighbours[];
}

/**
 * When we set up place metadata
 */
export interface ActionChangePlaces extends AppSpecificAction {
	type: StateActionType.FETCH_PLACES;
	payload: PlaceWithNeighbours[];
}

/**
 * When we set up period metadata
 */
export interface ActionChangePeriods extends AppSpecificAction {
	type: StateActionType.FETCH_PERIODS;
	payload: PeriodWithNeighbours[];
}

/**
 * When we set up style metadata
 */
export interface ActionChangeStyles extends AppSpecificAction {
	type: StateActionType.FETCH_STYLES;
	payload: FullPantherEntityWithNeighboursAsProp[];
}

/**
 * Activate or deactivate layer in render and status
 */
export interface ActionLayerActiveChange extends AppSpecificAction {
	type: StateActionType.LAYER_ACTIVE_CHANGE;
	payload: { key: string; newValue: boolean };
}

/**
 * Activate or deactivate layer in map
 */
export interface ActionMapLayerActiveChange extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_ACTIVE_CHANGE;
	payload: { mapKey: string; layerKey: string; isActive: boolean };
}

/**
 * Change map layer interactivity
 */
export interface ActionMapLayerInteractivityChange extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE;
	payload: { mapKey: string; layerKey: string; isInteractive: boolean };
}

/**
 * Change map layer opacity
 */
export interface ActionMapLayerOpacityChange extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_OPACITY_CHANGE;
	payload: { mapKey: string; layerKey: string; opacity: number };
}

/**
 * Add layer to map
 */
export interface ActionMapLayerAdd extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_ADD;
	payload: { mapKey: string; layer: Partial<RenderingLayer>; index?: number };
}

/**
 * Remove layer from map
 */
export interface ActionMapLayerRemove extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_REMOVE;
	payload: { mapKey: string; layerKey: string };
}

/**
 * Set feature key for vector layer in map's rendering layers
 */
export interface ActionMapLayerSetFeatureKey extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_SET_FEATURE_KEY;
	payload: {
		mapKey: string;
		layerKey: string;
		featureKey: string | number;
		customSelectionStyle?: Partial<Selection>;
	};
}

/** Add feature key to map layer selections */
export interface ActionMapLayerAddFeatureKey extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_ADD_FEATURE_KEY;
	payload: {
		mapKey: string;
		layerKey: string;
		featureKey: string | number;
		customSelectionStyle?: Partial<Selection>;
	};
}

/** Remove feature key from map layer selections */
export interface ActionMapLayerRemoveFeatureKey extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY;
	payload: { mapKey: string; layerKey: string; featureKey: string | number };
}

/**
 * Atomically replace all feature keys for a map layer selection.
 * Assigns colour indexes automatically matching the logic of MAP_LAYER_ADD_FEATURE_KEY.
 */
export interface ActionMapLayerSetFeatureKeys extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_SET_FEATURE_KEYS;
	payload: {
		mapKey: string;
		layerKey: string;
		featureKeys: Array<string | number>;
		customSelectionStyle?: Partial<Selection>;
	};
}

/**
 * Atomically clear all feature keys for a map layer selection.
 */
export interface ActionMapLayerClearSelection extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_CLEAR_SELECTION;
	payload: { mapKey: string; layerKey: string };
}

/**
 * Add map to map set
 */
export interface ActionMapAddToMapSet extends AppSpecificAction {
	type: StateActionType.MAP_ADD_TO_MAP_SET;
	payload: { mapSetKey: string; map: SingleMapModel };
}

/**
 * Remove map from map set
 */
export interface ActionMapRemoveFromMapSet extends AppSpecificAction {
	type: StateActionType.MAP_REMOVE_FROM_MAP_SET;
	payload: { mapSetKey: string; mapKey: string };
}

/**
 * Remove maps from map set by keys
 */
export interface ActionMapSetRemoveMapsByKeys extends AppSpecificAction {
	type: StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS;
	payload: { mapSetKey: string; mapKeys: string[] };
}

/**
 * Update state with data
 */
export interface ActionGlobalStateUpdate extends AppSpecificAction {
	type: StateActionType.GLOBAL_STATE_UPDATE;
	payload: {
		mapSets: MapSetModel[];
		maps: SingleMapModel[];
		renderingLayers: RenderingLayer[];
		selections: Selection[];
	};
}

/**
 * Apply persistent state
 * TODO add payload params
 */
export interface ActionApplyPersistentState extends AppSpecificAction {
	type: StateActionType.APPLY_PERSISTENT_STATE;
	payload: { mapSets: MapSetModel[]; maps: SingleMapModel[]; renderingLayers: RenderingLayer[] };
}

/**
 * Change map view
 */
export interface ActionMapViewChange extends AppSpecificAction {
	type: StateActionType.MAP_VIEW_CHANGE;
	payload: { key: string; viewChange: Partial<MapView> };
}

/**
 * Change map set sync
 */
export interface ActionMapSetSyncChange extends AppSpecificAction {
	type: StateActionType.MAP_SET_SYNC_CHANGE;
	payload: { key: string; syncChange: Partial<MapSetSync> };
}

/**
 * Change map set mode
 */
export interface ActionMapSetModeChange extends AppSpecificAction {
	type: StateActionType.MAP_SET_MODE_CHANGE;
	payload: { key: string; mode: 'slider' | 'grid' };
}

/**
 * Add map set to state
 */
export interface ActionMapSetAdd extends AppSpecificAction {
	type: StateActionType.MAP_SET_ADD;
	payload: MapSetModel;
}

/**
 * Delete map set from state
 */
export interface ActionMapSetRemove extends AppSpecificAction {
	type: StateActionType.MAP_SET_REMOVE;
	payload: { mapSetKey: string };
}

/**
 * Add map to state
 */
export interface ActionMapAdd extends AppSpecificAction {
	type: StateActionType.MAP_ADD;
	payload: SingleMapModel;
}

/**
 * One of any of possible actions
 */
export type OneOfStateActions = AppSpecificAction &
	(
		| ActionChangeLayerSources
		| ActionChangeLayers
		| ActionChangePlaces
		| ActionChangeStyles
		| ActionChangePeriods
		| ActionSetApplicationNode
		| ActionLayerActiveChange
		| ActionMapLayerActiveChange
		| ActionMapLayerInteractivityChange
		| ActionMapAddToMapSet
		| ActionMapRemoveFromMapSet
		| ActionMapSetRemoveMapsByKeys
		| ActionMapLayerAdd
		| ActionMapLayerRemove
		| ActionMapLayerSetFeatureKey
		| ActionMapLayerAddFeatureKey
		| ActionMapLayerRemoveFeatureKey
		| ActionMapLayerOpacityChange
		| ActionMapViewChange
		| ActionMapSetSyncChange
		| ActionMapSetModeChange
		| ActionGlobalStateUpdate
		| ActionApplyPersistentState
		| ActionMapSetAdd
		| ActionMapSetRemove
		| ActionMapAdd
		| ActionGeometryDrawingUpdate
		| ActionMapLayerSetBulkSelection
	);

/**
 * Updates the geometryDrawing field of the RenderingLayer identified by layerKey.
 * Only the changed fields need to be provided (partial patch).
 */
export interface ActionGeometryDrawingUpdate extends AppSpecificAction {
	type: StateActionType.GEOMETRY_DRAWING_UPDATE;
	payload: {
		layerKey: string;
		patch: Partial<GeometryDrawingModel>;
	};
}

/**
 * Atomically set a named selection with explicit featureKeys and colour palette.
 * Unlike MAP_LAYER_SET_FEATURE_KEYS this action works by selectionKey (not mapKey/layerKey)
 * and gives the caller direct control over distinctItems.
 */
export interface ActionMapLayerSetBulkSelection extends AppSpecificAction {
	type: StateActionType.MAP_LAYER_SET_BULK_SELECTION;
	payload: {
		selectionKey: string;
		featureKeys: Array<string | number>;
		distinctColours: string[];
		/**
		 * When true each feature gets a cycling colour index (index % palette.length).
		 * When false (default) all features share index 0.
		 */
		distinctItems?: boolean;
	};
}
