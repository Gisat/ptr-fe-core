import { createContext, Dispatch } from 'react';
import { defaultStateValue } from './state.defaults';
import { AppSharedState } from './state.models';
import { OneOfStateActions } from './state.models.actions';


/**
 * Creates a pair of React contexts for managing shared state and its dispatch function.
 * 
 * @template AppSpecificState - Type extending AppSharedState that represents the application-specific state structure
 * @template AppSpecificActions - Type representing the possible actions that can be dispatched (defaults to OneOfStateActions)
 * 
 * @returns An object containing:
 * - sharedStateContext: React Context for the application state
 * - sharedStateDispatchContext: React Context for the dispatch function to update the state
 * 
 * @example
 * ```typescript
 * const { sharedStateContext, sharedStateDispatchContext } = createContextForSharedState<MyAppState>();
 * ```
 */
export const useApplicationSpecificStateContext = <
    AppSpecificState extends AppSharedState,
    AppSpecificActions = OneOfStateActions
>() => {
    // create context for shared state
    const sharedStateContext = createContext<AppSpecificState>(defaultStateValue() as AppSpecificState);

    // create context for shared state dispatch
    const sharedStateDispatchContext = createContext<Dispatch<AppSpecificActions>>(() => console.log('none'));

    return {
        sharedStateContext,
        sharedStateDispatchContext,
    };
}