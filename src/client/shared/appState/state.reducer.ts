import { ActionType } from './enum.state.actionType';
import { parseDatasourcesToRenderingLayers } from '../models/parsers.layers';
import { OneOfStateActions } from './state.models.actions';
import { AppSharedState } from './state.models';
import { Nullable } from '../coding/code.types';
import { reduceHandlerMapSetMapViewChange } from '../appState/reducerHandlers/mapSetMapViewChange';
import { reduceHandlerActiveLayerChange } from '../appState/reducerHandlers/activeLayerChange';
import { reduceHandlerMapSetSyncChange } from '../appState/reducerHandlers/mapSetSyncChange';
import { reduceHandlerGlobalStateUpdate } from '../appState/reducerHandlers/globalStateUpdate';
import { reduceHandlerMapLayerActiveChange } from '../appState/reducerHandlers/mapLayerActiveChange';
import { reduceHandlerMapLayerOpacityChange } from '../appState/reducerHandlers/mapLayerOpacityChange';

/**
 * React reducer for shared application state. Use it in useReducer react hook
 * @param currentState Current state instance
 * @param action One of possible actions for the application shared state
 * @returns New version of application shared state
 */
export const reducerSharedAppState = (
    currentState: AppSharedState,
    action: Nullable<OneOfStateActions>
): AppSharedState => {
    if (!action) return currentState;

    switch (action.type) {
        case ActionType.FETCH_SOURCES:
            return {
                ...currentState,
                renderingLayers: currentState.renderingLayers
                    ? [
                            ...currentState.renderingLayers,
                            ...parseDatasourcesToRenderingLayers(action.payload, currentState.appNode),
                        ]
                    : parseDatasourcesToRenderingLayers(action.payload, currentState.appNode),
            };

        case ActionType.APP_NODE:
            return { ...currentState, appNode: action.payload };

        case ActionType.LAYER_ACTIVE_CHANGE:
            return reduceHandlerActiveLayerChange(currentState, action);

        case ActionType.GLOBAL_STATE_UPDATE:
            return reduceHandlerGlobalStateUpdate(currentState, action);

        case ActionType.APPLY_PERSISTENT_STATE:
            return { ...currentState, ...action.payload };

        case ActionType.MAP_VIEW_CHANGE:
            return reduceHandlerMapSetMapViewChange(currentState, action);

        case ActionType.MAP_LAYER_ACTIVE_CHANGE:
            return reduceHandlerMapLayerActiveChange(currentState, action);

        case ActionType.MAP_LAYER_OPACITY_CHANGE:
            return reduceHandlerMapLayerOpacityChange(currentState, action);

        case ActionType.MAP_SET_SYNC_CHANGE:
            return reduceHandlerMapSetSyncChange(currentState, action);

        default:
            throw new Error(
                `Shared State: Unknown action type "${(action as OneOfStateActions).type}"`
            );
    }
};