import { StateActionType } from './enum.state.actionType';
import {
	ActionChangeLayerSources,
	ActionGlobalStateUpdate,
	ActionLayerActiveChange,
	ActionMapAdd,
	ActionMapAddToMapSet,
	ActionMapLayerActiveChange,
	ActionMapLayerAdd,
	ActionMapLayerAddFeatureKey,
	ActionMapLayerInteractivityChange,
	ActionMapLayerOpacityChange,
	ActionMapLayerRemove,
	ActionMapLayerRemoveFeatureKey,
	ActionMapLayerSetFeatureKey,
	ActionMapRemoveFromMapSet,
	ActionMapSetAdd,
	ActionMapSetModeChange,
	ActionMapSetRemove,
	ActionMapSetRemoveMapsByKeys,
	ActionMapSetSyncChange,
	ActionMapViewChange,
} from './state.models.actions';
import { AppSharedState } from './state.models';
import { reduceHandlerMapSetMapViewChange } from './reducerHandlers/mapSetMapViewChange';
import { reduceHandlerActiveLayerChange } from './reducerHandlers/activeLayerChange';
import { reduceHandlerMapSetSyncChange } from './reducerHandlers/mapSetSyncChange';
import { reduceHandlerGlobalStateUpdate } from './reducerHandlers/globalStateUpdate';
import { reduceHandlerMapLayerActiveChange } from './reducerHandlers/mapLayerActiveChange';
import { reduceHandlerMapLayerAdd } from './reducerHandlers/mapLayerAdd';
import { reduceHandlerMapLayerRemove } from './reducerHandlers/mapLayerRemove';
import { reduceHandlerMapLayerOpacityChange } from './reducerHandlers/mapLayerOpacityChange';
import { reduceHandlerFetchSources } from './reducerHandlers/fetchSourcesUpdate';
import { reduceHandlerMapSetAddMap } from './reducerHandlers/mapSetAddMap';
import { reduceHandlerRemoveMapSetMapsByKeys } from './reducerHandlers/mapSetRemoveMapsByKeys';
import { reduceHandlerMapSetRemoveMap } from './reducerHandlers/mapSetRemoveMap';
import { reduceHandlerMapSetModeChange } from './reducerHandlers/mapSetModeChange';
import { reduceHandlerMapSetAddMapSet } from './reducerHandlers/mapSetAdd';
import { reduceHandlerMapSetRemove } from './reducerHandlers/mapSetRemove';
import { AppSpecificAction, AppSpecificReducerMap } from './state.models.reducer';
import { reduceHandlerAddFeatureKeyToSelections } from './reducerHandlers/mapLayerAddFeatureKeyToSelections';
import { reduceHandlerRemoveFeatureKeyInSelections } from './reducerHandlers/mapLayerRemoveFeatureKeyInSelections';
import { reduceHandlerSetFeatureKeyInSelections } from './reducerHandlers/mapLayerSetFeatureKeyInSelections';
import { reduceHandlerMapLayerInteractivityChange } from './reducerHandlers/mapLayerInteractivityChange';
import { reduceHandlerMapAdd } from './reducerHandlers/mapAdd';

/**
 * Creates a reducer function for a specific application state that combines core and application-specific reducers.
 *
 * @template ApplicationSpecificState - The type of the application-specific state, must extend AppSharedState
 * @param appSpecificReducerMap - A Map containing application-specific action types and their corresponding reducer functions
 * @returns A reducer function compatible with React's useReducer hook that handles both core and application-specific state updates
 *
 * @example
 * ```typescript
 * const appReducers = new Map([
 *   ['CUSTOM_ACTION', (state, action) => ({ ...state, custom: action.payload })]
 * ]);
 * const reducer = reducerForSpecificApp(appReducers);
 * ```
 *
 * @remarks
 * The returned reducer handles:
 * - Core state actions (layers, places, periods, styles, etc.)
 * - Map-related actions (view changes, layer management, etc.)
 * - MapSet-related actions (sync, mode changes, etc.)
 * - Application-specific actions defined in the appSpecificReducerMap
 *
 * @throws {Error} When an unknown action type is dispatched
 */
export const reducerForSpecificApp = <ApplicationSpecificState extends AppSharedState = AppSharedState>(
	appSpecificReducerMap: AppSpecificReducerMap<ApplicationSpecificState>
) => {
	/**
	 * A reducer function for managing application state in React components.
	 *
	 * This reducer handles both core and application-specific state updates through a Map-based
	 * switch pattern. It processes various action types including map operations, layer management,
	 * and global state updates.
	 *
	 * @param currentState - The current application state before the reduction
	 * @param action - The action object containing the type and payload for state modification
	 * @throws {Error} When an unknown action type is provided
	 * @returns {ApplicationSpecificState} The new application state after applying the reduction
	 *
	 * The reducer follows a three-step process:
	 * 1. Initializes core action handlers
	 * 2. Incorporates application-specific reducers
	 * 3. Executes the appropriate reducer based on the action type
	 *
	 * @example
	 * const newState = reducerForReact(currentState, {
	 *   type: StateActionType.MAP_LAYER_ADD,
	 *   payload: layerData
	 * });
	 */
	const reducerForReact = (
		currentState: ApplicationSpecificState,
		action: AppSpecificAction
	): ApplicationSpecificState => {
		// 0. if there is no action, return the current state
		if (!action) return currentState;

		// 1. we need to fill the reducer switch Map with ptr-fe-core actions and reducers

		// prepare a switch map to handle the actions
		let reducerSwitch = new Map<string, () => ApplicationSpecificState>();

		// just push the action payload to the state
		reducerSwitch.set(StateActionType.APP_NODE, () => ({ ...currentState, appNode: action.payload }));
		reducerSwitch.set(StateActionType.FETCH_LAYERS, () => ({ ...currentState, layers: action.payload }));
		reducerSwitch.set(StateActionType.FETCH_PLACES, () => ({ ...currentState, places: action.payload }));
		reducerSwitch.set(StateActionType.FETCH_PERIODS, () => ({ ...currentState, periods: action.payload }));
		reducerSwitch.set(StateActionType.FETCH_STYLES, () => ({ ...currentState, styles: action.payload }));
		reducerSwitch.set(StateActionType.APPLY_PERSISTENT_STATE, () => ({ ...currentState, ...action.payload }));

		// use the specific handlers for each action type
		reducerSwitch.set(StateActionType.FETCH_SOURCES, () =>
			reduceHandlerFetchSources(currentState, action as ActionChangeLayerSources)
		);
		reducerSwitch.set(StateActionType.LAYER_ACTIVE_CHANGE, () =>
			reduceHandlerActiveLayerChange(currentState, action as ActionLayerActiveChange)
		);
		reducerSwitch.set(StateActionType.GLOBAL_STATE_UPDATE, () =>
			reduceHandlerGlobalStateUpdate(currentState, action as ActionGlobalStateUpdate)
		);
		reducerSwitch.set(StateActionType.MAP_VIEW_CHANGE, () =>
			reduceHandlerMapSetMapViewChange(currentState, action as ActionMapViewChange)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_ACTIVE_CHANGE, () =>
			reduceHandlerMapLayerActiveChange(currentState, action as ActionMapLayerActiveChange)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_ADD, () =>
			reduceHandlerMapLayerAdd(currentState, action as ActionMapLayerAdd)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_REMOVE, () =>
			reduceHandlerMapLayerRemove(currentState, action as ActionMapLayerRemove)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_INTERACTIVITY_CHANGE, () =>
			reduceHandlerMapLayerInteractivityChange(currentState, action as ActionMapLayerInteractivityChange)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_SET_FEATURE_KEY, () =>
			reduceHandlerSetFeatureKeyInSelections(currentState, action as ActionMapLayerSetFeatureKey)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_ADD_FEATURE_KEY, () =>
			reduceHandlerAddFeatureKeyToSelections(currentState, action as ActionMapLayerAddFeatureKey)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_REMOVE_FEATURE_KEY, () =>
			reduceHandlerRemoveFeatureKeyInSelections(currentState, action as ActionMapLayerRemoveFeatureKey)
		);
		reducerSwitch.set(StateActionType.MAP_LAYER_OPACITY_CHANGE, () =>
			reduceHandlerMapLayerOpacityChange(currentState, action as ActionMapLayerOpacityChange)
		);
		reducerSwitch.set(StateActionType.MAP_ADD_TO_MAP_SET, () =>
			reduceHandlerMapSetAddMap(currentState, action as ActionMapAddToMapSet)
		);
		reducerSwitch.set(StateActionType.MAP_ADD, () => reduceHandlerMapAdd(currentState, action as ActionMapAdd));
		reducerSwitch.set(StateActionType.MAP_REMOVE_FROM_MAP_SET, () =>
			reduceHandlerMapSetRemoveMap(currentState, action as ActionMapRemoveFromMapSet)
		);
		reducerSwitch.set(StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS, () =>
			reduceHandlerRemoveMapSetMapsByKeys(currentState, action as ActionMapSetRemoveMapsByKeys)
		);
		reducerSwitch.set(StateActionType.MAP_SET_SYNC_CHANGE, () =>
			reduceHandlerMapSetSyncChange(currentState, action as ActionMapSetSyncChange)
		);
		reducerSwitch.set(StateActionType.MAP_SET_MODE_CHANGE, () =>
			reduceHandlerMapSetModeChange(currentState, action as ActionMapSetModeChange)
		);
		reducerSwitch.set(StateActionType.MAP_SET_ADD, () =>
			reduceHandlerMapSetAddMapSet(currentState, action as ActionMapSetAdd)
		);
		reducerSwitch.set(StateActionType.MAP_SET_REMOVE, () =>
			reduceHandlerMapSetRemove(currentState, action as ActionMapSetRemove)
		);

		// 2. now we need to add the application specific actions and reducers to the switch map

		// the map is conbination of action type key and reducer function with payload
		for (const [actionType, reducerFunc] of appSpecificReducerMap.entries()) {
			reducerSwitch.set(actionType, () => reducerFunc(currentState, action as AppSpecificAction));
		}

		// 3. now we use the switch map to handle actions inside the final application

		// read the new state from the switch map
		const newState = reducerSwitch.get(action.type as string);

		// if the action type is not found in the switch map, throw an error
		if (!newState) {
			throw new Error(`Shared State: Unknown action type "${(action as any).type}"`);
		}

		// return the new state as called from the switch map result
		return newState();
	};

	// return the reducer function for the react hook
	// this function will be used in the useReducer hook
	return reducerForReact;
};
