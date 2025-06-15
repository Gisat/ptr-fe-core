import { StateActionType } from './enum.state.actionType';
import { parseDatasourcesToRenderingLayers } from '../models/parsers.layers';
import { OneOfStateActions } from './state.models.actions';
import { AppSharedState } from './state.models';
import { Nullable } from '../../../globals/shared/coding/code.types';
import { reduceHandlerMapSetMapViewChange } from '../appState/reducerHandlers/mapSetMapViewChange';
import { reduceHandlerActiveLayerChange } from '../appState/reducerHandlers/activeLayerChange';
import { reduceHandlerMapSetSyncChange } from '../appState/reducerHandlers/mapSetSyncChange';
import { reduceHandlerGlobalStateUpdate } from '../appState/reducerHandlers/globalStateUpdate';
import { reduceHandlerMapLayerActiveChange } from '../appState/reducerHandlers/mapLayerActiveChange';
import { reduceHandlerMapLayerAdd } from '../appState/reducerHandlers/mapLayerAdd';
import { reduceHandlerMapLayerOpacityChange } from '../appState/reducerHandlers/mapLayerOpacityChange';
import { reduceHandlerMapSetAddMap } from '../appState/reducerHandlers/mapSetAddMap';
import { reduceHandlerMapSetRemoveMap } from '../appState/reducerHandlers/mapSetRemoveMap';
import { reduceHandlerRemoveMapSetMapsByKeys } from '../appState/reducerHandlers/mapSetRemoveMapsByKeys';
import { reduceHandlerMapSetModeChange } from '../appState/reducerHandlers/mapSetModeChange';

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
		case StateActionType.FETCH_SOURCES:
			return {
				...currentState,
				renderingLayers: currentState.renderingLayers
					? [
							...currentState.renderingLayers,
							...parseDatasourcesToRenderingLayers(action.payload, currentState.appNode),
						]
					: parseDatasourcesToRenderingLayers(action.payload, currentState.appNode),
			};
		case StateActionType.APP_NODE:
			return { ...currentState, appNode: action.payload };

		case StateActionType.FETCH_LAYERS:
			return { ...currentState, layers: action.payload };

		case StateActionType.FETCH_PLACES:
			return { ...currentState, places: action.payload };

		case StateActionType.FETCH_PERIODS:
			return { ...currentState, periods: action.payload };

		case StateActionType.FETCH_STYLES:
			return { ...currentState, styles: action.payload };

		case StateActionType.LAYER_ACTIVE_CHANGE:
			return reduceHandlerActiveLayerChange(currentState, action);

		case StateActionType.GLOBAL_STATE_UPDATE:
			return reduceHandlerGlobalStateUpdate(currentState, action);

		case StateActionType.APPLY_PERSISTENT_STATE:
			return { ...currentState, ...action.payload };

		case StateActionType.MAP_VIEW_CHANGE:
			return reduceHandlerMapSetMapViewChange(currentState, action);

		case StateActionType.MAP_LAYER_ACTIVE_CHANGE:
			return reduceHandlerMapLayerActiveChange(currentState, action);

		case StateActionType.MAP_LAYER_ADD:
			return reduceHandlerMapLayerAdd(currentState, action);

		case StateActionType.MAP_ADD_TO_MAP_SET:
			return reduceHandlerMapSetAddMap(currentState, action);

		case StateActionType.MAP_REMOVE_FROM_MAP_SET:
			return reduceHandlerMapSetRemoveMap(currentState, action);

		case StateActionType.MAP_SET_REMOVE_MAPS_BY_KEYS:
			return reduceHandlerRemoveMapSetMapsByKeys(currentState, action);

		case StateActionType.MAP_LAYER_OPACITY_CHANGE:
			return reduceHandlerMapLayerOpacityChange(currentState, action);

		case StateActionType.MAP_SET_SYNC_CHANGE:
			return reduceHandlerMapSetSyncChange(currentState, action);

		case StateActionType.MAP_SET_MODE_CHANGE:
			return reduceHandlerMapSetModeChange(currentState, action);

		default:
			throw new Error(`Shared State: Unknown action type "${(action as OneOfStateActions).type}"`);
	}
};
