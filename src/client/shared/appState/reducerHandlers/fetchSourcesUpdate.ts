import { parseDatasourcesToRenderingLayers } from '../../models/parsers.layers';
import { AppSharedState } from '../state.models';
import { ActionChangeLayerSources } from '../state.models.actions';

// TODO: Replace as any by Datasource[] when the type is available in the shared state models

/**
 * Handles the update of rendering layers in the application state by merging new data sources.
 *
 * This reducer handler takes the current application state and an action containing new data sources,
 * parses the data sources into rendering layers, and appends them to the existing rendering layers.
 * If no rendering layers exist in the current state, it initializes the rendering layers with the parsed data.
 *
 * @template T - The type of the application shared state, extending AppSharedState.
 * @param state - The current application state.
 * @param action - The action containing the new data sources to be added, of type ActionChangeLayerSources.
 * @returns The updated application state with the new rendering layers included.
 */
export const reduceHandlerFetchSources = <T extends AppSharedState = AppSharedState>(
    state: T,
    action: ActionChangeLayerSources
): T => {
    return {
        ...state, renderingLayers: state.renderingLayers
            ? [
                ...state.renderingLayers,
                ...parseDatasourcesToRenderingLayers(action.payload as any[], state.appNode), 
            ]
            : parseDatasourcesToRenderingLayers(action.payload as any[], state.appNode),
    };
};
