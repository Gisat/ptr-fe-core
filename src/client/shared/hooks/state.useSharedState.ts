import { Dispatch, useContext, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppSharedState } from '../appState/state.models';
import { OneOfStateActions } from '../appState/state.models.actions';
import { SharedStateContext, SharedStateDispatchContext } from '../appState/state.context';


/**
 * A custom React hook that provides access to shared state and a dispatch function
 * for managing application state using React Context.
 *
 * @template AppSpecificState - A type extending `AppSharedState` representing the application-specific state structure.
 * @template AppSpecificActions - A type representing the possible actions (defaults to `OneOfStateActions`).
 *
 * @param {boolean} [logSharedState=false] - Whether to log the previous state, action, and current state for debugging.
 *
 * @returns {[AppSpecificState, Dispatch<AppSpecificActions>]} A tuple containing:
 * - The current shared state of type `AppSpecificState`.
 * - A dispatch function for updating the state with `AppSpecificActions`.
 *
 * @throws {Error} If the hook is used outside of a `SharedStateProvider` context.
 *
 */

export const useSharedState = <
	AppSpecificState extends AppSharedState,
	AppSpecificActions = OneOfStateActions
>(
	logSharedState: boolean = false
): [AppSpecificState, Dispatch<AppSpecificActions>] => {

	// Access the shared state from the context
	const sharedState = useContext(SharedStateContext);
	// Access the dispatch function from the context
	const sharedStateDispatch = useContext(SharedStateDispatchContext);
	// Ref to keep track of the previous state for logging purposes
	const prevStateRef = useRef<AppSpecificState | undefined>(undefined);

	if (sharedState === undefined || sharedStateDispatch === undefined) {
		throw new Error('Use Shared State hook has problem with state contexts');
	}

	/**
	 * A wrapped dispatch function that logs the previous state, action, and current state
	 * if `logSharedState` is enabled.
	 */
	const dispatchWithLog = useCallback<Dispatch<AppSpecificActions>>(
		(action) => {
			if (logSharedState) {
				console.log('--- SharedState LOG ---');
				console.log('Previous state:', prevStateRef.current);
				console.log('Action:', action);
			}
			sharedStateDispatch(action as any);
		},
		[logSharedState, sharedStateDispatch]
	);

	useEffect(() => {
		if (logSharedState) {
			console.log('Current state:', sharedState);
		}
		prevStateRef.current = sharedState as AppSpecificState;
	}, [sharedState, logSharedState]);

	return useMemo(
		() => [sharedState as AppSpecificState, dispatchWithLog],
		[sharedState, dispatchWithLog]
	);
};