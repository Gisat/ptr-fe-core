/**
 * Enum representing action types for managing the shared application state.
 */
export enum StateActionType {
  /** Action to fetch data sources. */
  FETCH_SOURCES = 'fetchSources',
  
  /** Action to fetch layers (TODO layerTemplates?). */
  FETCH_LAYERS = 'fetchLayers',
  
  /** Action to fetch places */
  FETCH_PLACES = 'fetchPlaces',

  /** Action to update the application node. */
  APP_NODE = 'appNode',

  /** Action to change the active layer. */
  LAYER_ACTIVE_CHANGE = 'layerActiveChange',

  /** Action to update the global application state. */
  GLOBAL_STATE_UPDATE = 'globalStateUpdate',

  /** Action to apply a persistent state to the application. */
  APPLY_PERSISTENT_STATE = 'applyPersistentState',

  /** Action to change the map view (e.g., zoom, center, bounds). */
  MAP_VIEW_CHANGE = 'mapViewChange',

  /** Action to change the active map layer. */
  MAP_LAYER_ACTIVE_CHANGE = 'mapLayerActiveChange',

  /** Action to change the opacity of a map layer. */
  MAP_LAYER_OPACITY_CHANGE = 'mapLayerOpacityChange',

  /** Action to toggle or change map set synchronization. */
  MAP_SET_SYNC_CHANGE = 'mapSetSyncChange',
}