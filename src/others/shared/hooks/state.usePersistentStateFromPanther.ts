import { AppSharedState } from '@core/src/shared/appState/state.models';
import { ActionApplyPersistentState } from '@core/src/shared/appState/state.models.actions';
import { useStateFromPanther } from '@core/src/shared/hooks/state.useStateFromPanther';
import { usePersistentState } from '@core/src/shared/sqlite/hooks.persistentState';
import { useEffect, useState } from 'react';

interface usePersistentStateFromPantherProps {
	fetchUrl: string;
	defaultAppState?: Partial<AppSharedState>;
	setPersistentStateOnDispatch: boolean;
	setPersistentStateOnDispatchDelay: number;
	loginRedirectPath?: string;
	errorRedirectPath?: string;
}

/**
 * A custom hook that combines fetching shared application state from Panther with persistent state management.
 *
 * This hook integrates the shared state fetched from Panther with a persistent state stored locally.
 * It ensures that the persistent state is applied on initial load and updates the persistent state
 * whenever the shared state changes, with an optional delay to prevent flickering.
 *
 * @param {string} fetchUrl - The URL to fetch the shared application state from Panther.
 * @param {Partial<AppSharedState>} [defaultAppState] - The default application state to merge with the fetched state.
 * @param {boolean} [setPersistentStateOnDispatch=true] - Whether to update the persistent state on dispatch actions.
 * @param {number} [setPersistentStateOnDispatchDelay=2000] - Delay in milliseconds before updating the persistent state.
 * @param {string} [loginRedirectPath] - Optional path to redirect to in case of login issues.
 * @param {string} [errorRedirectPath] - Optional path to redirect to in case of errors.
 * @returns {Object} An object containing the shared application state, loading status, dispatch function, and persistent state setter.
 */
export const usePersistentStateFromPanther = ({
	fetchUrl,
	defaultAppState,
	setPersistentStateOnDispatch = true,
	setPersistentStateOnDispatchDelay = 2000,
	loginRedirectPath,
	errorRedirectPath,
}: usePersistentStateFromPantherProps) => {
	// Fetch shared application state from Panther using a custom hook
	const { isLoading, sharedAppState, dispatch } = useStateFromPanther({
		fetchUrl,
		defaultAppState,
		loginRedirectPath,
		errorRedirectPath,
	});

	// Manage persistent state using a custom hook
	const { state, expiresAt: persistentStateExpiresAt, setPersistentState } = usePersistentState(sharedAppState);
	const [persistentStateLoaded, setPersistentStateLoaded] = useState(false);

	// Apply persistent state on initial load if it exists
	useEffect(() => {
		if (persistentStateExpiresAt && !persistentStateLoaded) {
			dispatch({
				type: 'applyPersistentState',
				payload: state,
			} as ActionApplyPersistentState);
			setPersistentStateLoaded(true);
		}
	}, [state, persistentStateExpiresAt, persistentStateLoaded]);

	// Update persistent state when the shared application state changes
	useEffect(() => {
		if (setPersistentStateOnDispatch) {
			// Use a timeout to delay persistent state updates and prevent flickering
			const timeoutId = setTimeout(() => {
				setPersistentState(sharedAppState);
			}, setPersistentStateOnDispatchDelay);
			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [sharedAppState, setPersistentStateOnDispatch, setPersistentStateOnDispatchDelay]);

	return {
		sharedAppState,
		isLoading,
		dispatch,
		setPersistentState,
	};
};
