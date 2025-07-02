import { StateActionType } from './enum.state.actionType';
import {
	ActionChangeLayerSources,
	ActionGlobalStateUpdate,
	ActionLayerActiveChange,
	ActionMapAddToMapSet,
	ActionMapLayerActiveChange,
	ActionMapLayerAdd,
	ActionMapLayerOpacityChange,
	ActionMapRemoveFromMapSet,
	ActionMapSetAdd,
	ActionMapSetModeChange,
	ActionMapSetRemove,
	ActionMapSetRemoveMapsByKeys,
	ActionMapSetSyncChange,
	ActionMapViewChange,
	OneOfStateActions,
} from './state.models.actions';
import { AppSharedState } from './state.models';
import { reduceHandlerMapSetMapViewChange } from './reducerHandlers/mapSetMapViewChange';
import { reduceHandlerActiveLayerChange } from './reducerHandlers/activeLayerChange';
import { reduceHandlerMapSetSyncChange } from './reducerHandlers/mapSetSyncChange';
import { reduceHandlerGlobalStateUpdate } from './reducerHandlers/globalStateUpdate';
import { reduceHandlerMapLayerActiveChange } from './reducerHandlers/mapLayerActiveChange';
import { reduceHandlerMapLayerAdd } from './reducerHandlers/mapLayerAdd';
import { reduceHandlerMapLayerOpacityChange } from './reducerHandlers/mapLayerOpacityChange';
import { reduceHandlerFetchSources } from './reducerHandlers/fetchSourcesUpdate';
import { reduceHandlerMapSetAddMap } from './reducerHandlers/mapSetAddMap';
import { reduceHandlerRemoveMapSetMapsByKeys } from './reducerHandlers/mapSetRemoveMapsByKeys';
import { reduceHandlerMapSetRemoveMap } from './reducerHandlers/mapSetRemoveMap';
import { reduceHandlerMapSetModeChange } from './reducerHandlers/mapSetModeChange';
import { reduceHandlerMapSetAddMapSet } from './reducerHandlers/mapSetAdd';
import { reduceHandlerMapSetRemove } from './reducerHandlers/mapSetRemove';

/**
 * General application specific action type.
 * This is used to define actions that are specific to a particular application.
 * The action type is a string and the payload can be any type.
 */
export type AppSpecificAction = {
	type: string | any;
	payload: any;
};

/**
 * General application specific reducer function type.
 * This function takes the current state and an action, and returns the new state.
 * The action can be a general application specific action or one of the state actions.
 */
export type AppSpecficReducerFunc<ApplicationSpecificState extends AppSharedState> = (
	currentState: ApplicationSpecificState,
	action: AppSpecificAction
) => ApplicationSpecificState;

export type AppSpecificReducerMap<ApplicationSpecificState extends AppSharedState> =
	Map<string, AppSpecficReducerFunc<ApplicationSpecificState>>

export const reducerForSpecificApp = <ApplicationSpecificState extends AppSharedState>(
	appSpecificReducerMap: AppSpecificReducerMap<ApplicationSpecificState>
) => {

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
		reducerSwitch.set(StateActionType.MAP_LAYER_OPACITY_CHANGE, () =>
			reduceHandlerMapLayerOpacityChange(currentState, action as ActionMapLayerOpacityChange)
		);
		reducerSwitch.set(StateActionType.MAP_ADD_TO_MAP_SET, () =>
			reduceHandlerMapSetAddMap(currentState, action as ActionMapAddToMapSet)
		);
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

		// 3. now we can use the switch map to handle the actions

		// read the new state from the switch map
		const newState = reducerSwitch.get(action.type as string);

		// if the action type is not found in the switch map, throw an error
		if (!newState) {
			throw new Error(`Shared State: Unknown action type "${(action as OneOfStateActions).type}"`);
		}

		// return the new state as called from the switch map result
		return newState();
	};

	// return the reducer function for the react hook
	// this function will be used in the useReducer hook
	return reducerForReact;
};
