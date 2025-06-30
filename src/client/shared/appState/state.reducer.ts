import { StateActionType } from './enum.state.actionType';
import { ActionChangeLayerSources, ActionGlobalStateUpdate, ActionLayerActiveChange, ActionMapLayerActiveChange, ActionMapLayerAdd, ActionMapLayerOpacityChange, ActionMapSetSyncChange, ActionMapViewChange, OneOfStateActions } from './state.models.actions';
import { AppSharedState } from './state.models';
import { Nullable } from '../../../globals/shared/coding/code.types';
import { reduceHandlerMapSetMapViewChange } from '../appState/reducerHandlers/mapSetMapViewChange';
import { reduceHandlerActiveLayerChange } from '../appState/reducerHandlers/activeLayerChange';
import { reduceHandlerMapSetSyncChange } from '../appState/reducerHandlers/mapSetSyncChange';
import { reduceHandlerGlobalStateUpdate } from '../appState/reducerHandlers/globalStateUpdate';
import { reduceHandlerMapLayerActiveChange } from '../appState/reducerHandlers/mapLayerActiveChange';
import { reduceHandlerMapLayerAdd } from '../appState/reducerHandlers/mapLayerAdd';
import { reduceHandlerMapLayerOpacityChange } from '../appState/reducerHandlers/mapLayerOpacityChange';
import { reduceHandlerFetchSources } from './reducerHandlers/fetchSourcesUpdate';

/**
 * Creates a reducer function for managing application-specific state in a shared app context.
 *
 * This higher-order reducer combines core shared state actions and reducers with application-specific
 * actions and reducers. It returns a reducer function suitable for use with React's `useReducer` hook.
 *
 * @template ApplicationSpecificState - The type of the application-specific state, extending the shared app state.
 * @template ApplicationSpecificActions - The union type of all application-specific actions.
 *
 * @param appSpecificActions - An array of application-specific action instances to be handled by the reducer.
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
	ApplicationSpecificState extends AppSharedState,
	ApplicationSpecificActions extends OneOfStateActions
>(
    appSpecificActions: ApplicationSpecificActions[],
    appSpecificReducers: Record<string, (state: ApplicationSpecificState, action: ApplicationSpecificActions) => ApplicationSpecificState>
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
        action: Nullable<ApplicationSpecificActions>,
    ): ApplicationSpecificState => {

        // if there is no action, return the current state
        if (!action) return currentState;

        // 1. we need to fill the reducer switch mao with ptr-fe-core actions and reducers

        // prepare a switch map to handle the actions
        const reducerSwitch = new Map<string, () => ApplicationSpecificState>()

        // just push the action payload to the state
        reducerSwitch.set(StateActionType.APP_NODE, () => ({ ...currentState, appNode: action.payload }));
        reducerSwitch.set(StateActionType.FETCH_LAYERS, () => ({ ...currentState, layers: action.payload }));
        reducerSwitch.set(StateActionType.FETCH_PLACES, () => ({ ...currentState, places: action.payload }));
        reducerSwitch.set(StateActionType.APPLY_PERSISTENT_STATE, () => ({ ...currentState, ...action.payload }));

        // use the specific handlers for each action type
        reducerSwitch.set(StateActionType.FETCH_SOURCES, () => reduceHandlerFetchSources(currentState, action as ActionChangeLayerSources));
        reducerSwitch.set(StateActionType.LAYER_ACTIVE_CHANGE, () => reduceHandlerActiveLayerChange(currentState, action as ActionLayerActiveChange));
        reducerSwitch.set(StateActionType.GLOBAL_STATE_UPDATE, () => reduceHandlerGlobalStateUpdate(currentState, action as ActionGlobalStateUpdate));
        reducerSwitch.set(StateActionType.MAP_VIEW_CHANGE, () => reduceHandlerMapSetMapViewChange(currentState, action as ActionMapViewChange));
        reducerSwitch.set(StateActionType.MAP_LAYER_ACTIVE_CHANGE, () => reduceHandlerMapLayerActiveChange(currentState, action as ActionMapLayerActiveChange));

		reducerSwitch.set(StateActionType.MAP_LAYER_ADD, () => reduceHandlerMapLayerAdd(currentState, action as ActionMapLayerAdd));
        reducerSwitch.set(StateActionType.MAP_LAYER_OPACITY_CHANGE, () => reduceHandlerMapLayerOpacityChange(currentState, action as ActionMapLayerOpacityChange));
        reducerSwitch.set(StateActionType.MAP_SET_SYNC_CHANGE, () => reduceHandlerMapSetSyncChange(currentState, action as ActionMapSetSyncChange));


        // 2. now we need to add the application specific actions and reducers to the switch map

        // now add the application specific actions and reducers to the switch map
        for (const actionType of appSpecificActions) {

            // for the each action add reducer to the switch map
            const actionTypeString = actionType.type;
            const specificReducer = appSpecificReducers[actionTypeString];

            reducerSwitch.set(actionTypeString, () => specificReducer(currentState, actionType));
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

        // TODO: Delete the commented code below when the switch map is fully implemented
        // switch (action.type) {
        //     case StateActionType.FETCH_SOURCES:
        //         return {
        //             ...currentState,
        //             renderingLayers: currentState.renderingLayers
        //                 ? [
        //                     ...currentState.renderingLayers,
        //                     ...parseDatasourcesToRenderingLayers(action.payload, currentState.appNode),
        //                 ]
        //                 : parseDatasourcesToRenderingLayers(action.payload, currentState.appNode),
        //         };
        //     case StateActionType.APP_NODE:
        //         return { ...currentState, appNode: action.payload };

        //     case StateActionType.FETCH_LAYERS:
        //         return { ...currentState, layers: action.payload };

        //     case StateActionType.FETCH_PLACES:
        //         return { ...currentState, places: action.payload };

        //     case StateActionType.LAYER_ACTIVE_CHANGE:
        //         return reduceHandlerActiveLayerChange(currentState, action);

        //     case StateActionType.GLOBAL_STATE_UPDATE:
        //         return reduceHandlerGlobalStateUpdate(currentState, action);

        //     case StateActionType.APPLY_PERSISTENT_STATE:
        //         return { ...currentState, ...action.payload };

        //     case StateActionType.MAP_VIEW_CHANGE:
        //         return reduceHandlerMapSetMapViewChange(currentState, action);

        //     case StateActionType.MAP_LAYER_ACTIVE_CHANGE:
        //         return reduceHandlerMapLayerActiveChange(currentState, action);

        //     case StateActionType.MAP_LAYER_ADD:
        //         return reduceHandlerMapLayerAdd(currentState, action);

        //     case StateActionType.MAP_LAYER_OPACITY_CHANGE:
        //         return reduceHandlerMapLayerOpacityChange(currentState, action);

        //     case StateActionType.MAP_SET_SYNC_CHANGE:
        //         return reduceHandlerMapSetSyncChange(currentState, action);

        //     default:
        //         throw new Error(
        //             `Shared State: Unknown action type "${(action as OneOfStateActions).type}"`
        //         );
        // }
    };

    
    // return the reducer function for the react hook
    // this function will be used in the useReducer hook
    return reducerForReact;
}