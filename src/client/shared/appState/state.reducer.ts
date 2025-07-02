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
 * Creates a reducer function for managing application-specific state in a shared app context.
 *
 * This higher-order reducer combines core shared state actions and reducers with application-specific
 * actions and reducers. It returns a reducer function suitable for use with React's `useReducer` hook.
 *
 * @template ApplicationSpecificState - The type of the application-specific state, extending the shared app state.
 * @template ApplicationSpecificActions - The union type of all application-specific actions.
 *
 * @param appSpecificActionTypes - An array of application-specific action instances to be handled by the reducer.
 * @param appSpecificReducers - A mapping from action type strings to reducer functions for handling application-specific actions.
 *
 * @returns A reducer function that takes the current state and an action, and returns the new state.
 *
 * @throws {Error} If an unknown action type is encountered.
 *
 * @example
 * ```typescript
 * const reducer = reducerForSpecificApp<MyAppState, MyAppActions>(
 *   [myAction1, myAction2],
 *   {
 *     [MyActionTypes.MY_ACTION_1]: myAction1Reducer,
 *     [MyActionTypes.MY_ACTION_2]: myAction2Reducer,
 *   }
 * );
 * const [state, dispatch] = useReducer(reducer, initialState);
 * ```
 */
export const reducerForSpecificApp = <
	ApplicationSpecificState extends AppSharedState
>(
	appSpecificActionTypes: string[],
	appSpecificReducers: Map<
		string,
		(state: ApplicationSpecificState, action: {type: string, payload: any}) => ApplicationSpecificState
	>
) => {
	/**
	 * Reducer function for managing the shared application state.
	 *
	 * This reducer handles both core and application-specific actions by mapping action types
	 * to their corresponding state transformation logic using a switch map. It first processes
	 * core actions with predefined handlers, then dynamically adds application-specific reducers.
	 * If an unknown action type is encountered, an error is thrown.
	 *
	 * @param currentState - The current application-specific state.
	 * @param action - The dispatched action, which may be null.
	 * @returns The new application-specific state after applying the action.
	 * @throws Error if the action type is not recognized by the reducer.
	 */
	const reducerForReact = (
		currentState: ApplicationSpecificState,
		action: {type: string; payload: any} | OneOfStateActions
	): ApplicationSpecificState => {
		// if there is no action, return the current state
		if (!action) return currentState;

		// 1. we need to fill the reducer switch mao with ptr-fe-core actions and reducers

		// prepare a switch map to handle the actions
		const reducerSwitch = new Map<string, () => ApplicationSpecificState>();

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

		// now add the application specific actions and reducers to the switch map
		// iterate over the application specific action types
		// and add the corresponding reducer to the switch map
		// if the action type is not found in the switch map, throw an error
		for (const actionType of appSpecificActionTypes) {
			
			// for the each action add reducer to the switch map
			const appSpecificReducer = appSpecificReducers.get(actionType);

			if (!appSpecificReducer) {
				throw new Error(`Shared State Reducer: No reducer found for action type "${actionType}"`);
			}

			reducerSwitch.set(actionType, () => appSpecificReducer(currentState, action));
		}

		// 3. now we can use the switch map to handle the actions

		// read the new state from the switch map
		const newState = reducerSwitch.get(action.type);

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
