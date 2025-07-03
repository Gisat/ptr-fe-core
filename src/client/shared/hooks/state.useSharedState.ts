import { Dispatch, useContext } from 'react';
import { AppSharedState } from '../appState/state.models';
import { OneOfStateActions } from '../appState/state.models.actions';
import { useApplicationSpecificStateContext } from '../appState/state.context';


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

	// read application specific state context
	// this will create a pair of contexts for shared state and its dispatch function
	const {
		sharedStateContext,
		sharedStateDispatchContext,
	} = useApplicationSpecificStateContext<AppSpecificState, AppSpecificActions>();

	// load actual state context using native React useContext hook
	const sharedState = useContext(sharedStateContext);

	// load shared state dispatch funtion using native React useContext hook
	const sharedStateDispatch = useContext(sharedStateDispatchContext);

	// validate all
	if (sharedState === undefined || sharedStateDispatch === undefined) {
		throw new Error('Use Shared State hook has problem with state contexts');
	}

	// return as a tuple
	return [sharedState, sharedStateDispatch];
};

export default useSharedState;
