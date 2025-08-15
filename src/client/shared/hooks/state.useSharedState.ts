import { Dispatch, useContext } from 'react';
import { AppSharedState } from '../appState/state.models';
import { OneOfStateActions } from '../appState/state.models.actions';
import { SharedStateContext, SharedStateDispatchContext } from '../appState/state.context';


/**
 * A custom hook that provides access to shared state and dispatch function
 * Using application specific react contexts containing shared state and its dispatch function.
 * 
 * @template AppSpecificState - Type extending AppSharedState representing the application-specific state structure
 * @template AppSpecificActions - Type representing the possible actions (defaults to OneOfStateActions)
 * 
 * @returns A tuple containing:
 * - The current shared state of type AppSpecificState
 * - A dispatch function for updating the state with AppSpecificActions
 * 
 * @throws {Error} If the hook is used outside of a SharedStateProvider context
 * 
 * @example
 * ```typescript
 * const [state, dispatch] = useSharedState<MyAppState>();
 * ```
 */
export const useSharedState = <
	AppSpecificState extends AppSharedState,
	AppSpecificActions = OneOfStateActions
	>():[AppSpecificState, Dispatch<AppSpecificActions>] => {

	// load actual state context using native React useContext hook
	const sharedState = useContext(SharedStateContext);

	// log shared state in context for debugging
	console.log('### State in context', sharedState);

	// load shared state dispatch funtion using native React useContext hook
	const sharedStateDispatch = useContext(SharedStateDispatchContext);

	// validate all
	if (sharedState === undefined || sharedStateDispatch === undefined) {
		throw new Error('Use Shared State hook has problem with state contexts');
	}

	// return as a tuple
	return [sharedState as AppSpecificState, sharedStateDispatch as Dispatch<AppSpecificActions>];
};