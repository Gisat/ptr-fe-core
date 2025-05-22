import { AppSharedState } from '@core/src/shared/appState/state.models';
import { ActionGlobalStateUpdate } from '@core/src/shared/appState/state.models.actions';
import { useEffect, useReducer } from 'react';
import useSWR from 'swr';
import { ActionType } from '../appState/enum.state.actionType';
import { parseNodesFromPanther } from '../appState/parsers.nodesFromResponse';
import { defaultStateValue } from '../appState/state.defaults';
import { reducerSharedAppState } from '../appState/state.reducer';
import { swrFetcher } from '../helpers/utils';

interface useStateFromPantherProps {
	fetchUrl: string; // The API endpoint to fetch the application state.
	defaultAppState?: Partial<AppSharedState>; // Optional prefilled state to merge with the fetched data.
	loginRedirectPath?: string; // Path to redirect to in case of login issues (e.g., '/account').
	errorRedirectPath?: string; // Path to redirect to in case of errors (e.g., '/error').
}

/**
 * Custom hook for managing shared application state by fetching data from the Panther backend.
 *
 * This hook initializes a shared application state using a reducer, fetches data from the backend
 * using the SWR library, and updates the state based on the fetched data. It also supports optional
 * default state and redirect paths for handling login or error scenarios.
 *
 * @param {string} fetchUrl - The API endpoint to fetch the application state.
 * @param {Partial<AppSharedState>} [defaultAppState] - Optional prefilled state to merge with the fetched data.
 * @param {string} [loginRedirectPath] - Path to redirect to in case of login issues.
 * @param {string} [errorRedirectPath] - Path to redirect to in case of errors.
 * @returns {Object} An object containing the shared application state, error status, loading status, validation status, and the dispatch function.
 */
export const useStateFromPanther = ({
	fetchUrl,
	defaultAppState,
	loginRedirectPath,
	errorRedirectPath,
}: useStateFromPantherProps) => {
	// Initialize the app state with useReducer
	const [sharedAppState, dispatch] = useReducer(reducerSharedAppState, defaultStateValue());

	// Fetch data from the custom URL with SWR
	const { data, error, isLoading, isValidating } = useSWR(fetchUrl, (url: string) =>
		swrFetcher(url, {
			loginRedirectPath,
			errorRedirectPath,
		})
	);

	// Effect to update state based on the fetched data
	useEffect(() => {
		if (data) {
			// Parse the nodes from the response
			const { applicationsNode, datasourceNodes } = parseNodesFromPanther(data);

			// Dispatch actions to update the state
			dispatch({ type: ActionType.APP_NODE, payload: applicationsNode });
			dispatch({ type: ActionType.FETCH_SOURCES, payload: datasourceNodes });

			// If defaultAppState is provided, merge it with the fetched data
			if (defaultAppState) {
				dispatch({ type: 'globalStateUpdate', payload: defaultAppState } as ActionGlobalStateUpdate);
			}
		}
	}, [data, error]);

	// Return state and fetch status for usage in components
	return { sharedAppState, error, isLoading, isValidating, dispatch };
};
