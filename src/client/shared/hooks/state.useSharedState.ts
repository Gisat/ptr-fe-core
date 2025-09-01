import { Dispatch, useContext, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppSharedState } from '../appState/state.models';
import { OneOfStateActions } from '../appState/state.models.actions';
import { SharedStateContext, SharedStateDispatchContext } from '../appState/state.context';

/**
 * Hook exposing shared app state + a (stable) dispatch with optional logging.
 *
 * Issue (root cause of previous crash):
 * - Earlier "logger" version wrapped the original context dispatch in an inline function on every render.
 * - Components (e.g. map setup) had `dispatch` in a `useEffect` dependency array.
 * - Each render produced a new function identity ⇒ effect re-ran unnecessarily.
 * - Cleanup of the previous effect removed maps / mapSets before the new effect finished re‑adding them.
 * - Concurrently, other actions expected the map to exist ⇒ `Map with key ... not found`.
 * - React 18 StrictMode double invoke on mount amplified the window where state was inconsistent.
 *
 * Fixes applied here:
 * 1. `dispatchWithLog` wrapped in `useCallback` ⇒ stable identity unless logging flag or underlying dispatch changes.
 * 2. Returned tuple `[state, dispatch]` memoized with `useMemo` ⇒ consumer effects not retriggered by wrapper recreation.
 * 3. Previous state stored in a ref for before/after logging without causing re-renders.
 *
 * Logging behavior:
 * - Before dispatch: prints previous state + action (when enabled).
 * - After render (state change observed): prints current state.
 *
 * Safe usage:
 * const [state, dispatch] = useSharedState(true); // enable logging
 */
export const useSharedState = <
	AppSpecificState extends AppSharedState,
	AppSpecificActions = OneOfStateActions
>(
	logSharedState: boolean = false
): [AppSpecificState, Dispatch<AppSpecificActions>] => {

	// Access current shared state & base dispatch from their React Contexts.
	// If either is undefined, provider is missing or duplicate context instances exist (e.g. multiple library builds).
	const sharedState = useContext(SharedStateContext);
	const sharedStateDispatch = useContext(SharedStateDispatchContext);

	// Holds the previous state snapshot for pre-dispatch logging.
	// Using ref avoids extra renders (state changes stored imperatively).
	const prevStateRef = useRef<AppSpecificState | undefined>(undefined);

	if (sharedState === undefined || sharedStateDispatch === undefined) {
		// Preserve explicit failure instead of silent undefined propagation.
		throw new Error('Use Shared State hook has problem with state contexts');
	}

	/**
	 * Wrapped dispatch:
	 * - Stable (useCallback) to prevent dependency churn in consumer effects.
	 * - Logs previous state + action before delegating to real dispatch when enabled.
	 * Previous bug: lack of memoization caused a new function each render.
	 */
	const dispatchWithLog = useCallback<Dispatch<AppSpecificActions>>(
		(action) => {
			if (logSharedState) {
				console.log('--- SharedState LOG ---');
				console.log('Previous state:', prevStateRef.current);
				console.log('Action:', action);
			}
			// Cast kept minimal; assumes external typing guards actions.
			sharedStateDispatch(action as any);
		},
		[logSharedState, sharedStateDispatch]
	);

	/**
	 * Post-render effect:
	 * - Logs current state after updates (when logging enabled).
	 * - Updates ref so next dispatch sees the correct "previous" snapshot.
	 * Note: dependency on `sharedState` is intentional to detect changes only.
	 */
	useEffect(() => {
		if (logSharedState) {
			console.log('Current state:', sharedState);
		}
		prevStateRef.current = sharedState as AppSpecificState;
	}, [sharedState, logSharedState]);

	/**
	 * Memoize returned tuple:
	 * - Prevents downstream re-renders/effect triggers purely due to tuple identity changes.
	 * - Essential in combination with the stabilized dispatch to fully eliminate prior bug pattern.
	 */
	return useMemo(
		() => [sharedState as AppSpecificState, dispatchWithLog],
		[sharedState, dispatchWithLog]
	);
};