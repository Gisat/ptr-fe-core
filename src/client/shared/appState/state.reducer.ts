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
 * Shared application state reducer function.
 *
 * Handles state transitions for the shared application state based on dispatched actions.
 * Uses a `Map` as a switch to associate action types with their corresponding state transformations.
 *
 * @template ApplicationSpecificState - The type of the application-specific shared state, extending `AppSharedState`.
 * @template ApplicationSpecificActions - The type of one of possible application-specific actions, extending `OneOfStateActions`.
 *
 * @param currentState - The current application state.
 * @param action - The dispatched action, or `null`/`undefined` if no action is provided.
 * @returns The new application state after applying the action.
 *
 * @throws {Error} If the action type is not recognized by the reducer.
 *
 * @remarks
 * - If no action is provided, the current state is returned unchanged.
 * - For each supported action type, the reducer applies the corresponding state transformation.
 * - If an unknown action type is encountered, an error is thrown.
 */
export const reducerSharedAppState = <
    ApplicationSpecificState extends AppSharedState,
    ApplicationSpecificActions extends OneOfStateActions
>(
    currentState: ApplicationSpecificState,
    action: Nullable<ApplicationSpecificActions>
): ApplicationSpecificState => {

    // if there is no action, return the current state
    if (!action) return currentState;

    // prepare a switch map to handle the actions
    const reducerSwitch = new Map<string, ApplicationSpecificState>()

    // just push the action payload to the state
    reducerSwitch.set(StateActionType.APP_NODE, { ...currentState, appNode: action.payload });
    reducerSwitch.set(StateActionType.FETCH_LAYERS, { ...currentState, layers: action.payload });
    reducerSwitch.set(StateActionType.FETCH_PLACES, { ...currentState, places: action.payload });
    reducerSwitch.set(StateActionType.APPLY_PERSISTENT_STATE, { ...currentState, ...action.payload });

    // use the specific handlers for each action type
    reducerSwitch.set(StateActionType.FETCH_SOURCES, reduceHandlerFetchSources(currentState, action as ActionChangeLayerSources));
    reducerSwitch.set(StateActionType.LAYER_ACTIVE_CHANGE, reduceHandlerActiveLayerChange(currentState, action as ActionLayerActiveChange));
    reducerSwitch.set(StateActionType.GLOBAL_STATE_UPDATE, reduceHandlerGlobalStateUpdate(currentState, action as ActionGlobalStateUpdate));
    reducerSwitch.set(StateActionType.MAP_VIEW_CHANGE, reduceHandlerMapSetMapViewChange(currentState, action as ActionMapViewChange));
    reducerSwitch.set(StateActionType.MAP_LAYER_ACTIVE_CHANGE, reduceHandlerMapLayerActiveChange(currentState, action as ActionMapLayerActiveChange));

    reducerSwitch.set(StateActionType.MAP_LAYER_ADD, reduceHandlerMapLayerAdd(currentState, action as ActionMapLayerAdd));
    reducerSwitch.set(StateActionType.MAP_LAYER_OPACITY_CHANGE, reduceHandlerMapLayerOpacityChange(currentState, action as ActionMapLayerOpacityChange));
    reducerSwitch.set(StateActionType.MAP_SET_SYNC_CHANGE, reduceHandlerMapSetSyncChange(currentState, action as ActionMapSetSyncChange));

    // read the new state from the switch map
    const newState = reducerSwitch.get(action.type);

    // if the action type is not found in the switch map, throw an error
    if (!newState) {
        throw new Error(`Shared State: Unknown action type "${(action as OneOfStateActions).type}"`);
    }

    // return the new state
    return newState;

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