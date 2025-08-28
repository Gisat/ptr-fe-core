import { Dispatch, useContext, useRef, useEffect } from 'react';
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
 * @param logSharedState - Enable logging of previous state, action, and current state (default is false)
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
>(
	logSharedState: boolean = false
):[AppSpecificState, Dispatch<AppSpecificActions>] => {

	// load actual state context using native React useContext hook
	const sharedState = useContext(SharedStateContext);

	const sharedStateDispatch = useContext(SharedStateDispatchContext);

	const prevStateRef = useRef<AppSpecificState | undefined>(undefined);

	// Wrap dispatch to log previous state and action
	const dispatchWithLog: Dispatch<AppSpecificActions> = (action) => {
		if (logSharedState) {
			console.log('--- SharedState LOG ---');
			console.log('Previous state:', prevStateRef.current);
			console.log('Action:', action);
		}
		sharedStateDispatch(action);
	};

	useEffect(() => {
		if (logSharedState) {
			console.log('Current state:', sharedState);
		}
		prevStateRef.current = sharedState as AppSpecificState;
	}, [sharedState, logSharedState]);

	if (sharedState === undefined || sharedStateDispatch === undefined) {
		throw new Error('Use Shared State hook has problem with state contexts');
	}

	return [sharedState as AppSpecificState, dispatchWithLog];
};