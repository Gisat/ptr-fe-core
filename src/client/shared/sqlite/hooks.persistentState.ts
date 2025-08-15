import { useEffect, useState } from 'react';

/**
 * A custom React hook for managing persistent state stored on a server.
 *
 * @template T - The type of the state to be persisted.
 * @param {T} defaultState - The initial state to use if no persisted state is found.
 * @returns {Object} - An object containing:
 *   - `key` (string | null): The current key identifying the persisted state on the server.
 *   - `state` (T): The current persisted state value.
 *   - `expiresAt` (number): The expiration time of the state (timestamp).
 *   - `setPersistentState` (function): A function to update the state on the server and locally.
 *   - `error` (string | null): The error message, if any.
 *   - `clearError` (function): A function to clear the error state.
 */
export const usePersistentState = <T>(defaultState: T) => {
	// State to store the key identifying the persisted state on the server
	const [persistentStateKey, setPersistentStateKey] = useState<string | null>(null);

	// State to store the current persisted state value
	const [persistentState, setPersistentState] = useState<T>(defaultState);

	// State to store the expiration time of the persisted state
	const [expiresAtOfTheState, setExpiresAtState] = useState<number>(0);

	// State to track errors during fetching or updating the state
	const [error, setError] = useState<string | null>(null);

	/**
	 * Updates the persistent state by sending the new state to the server.
	 *
	 * @async
	 * @function
	 * @returns {Promise<void>} - Resolves when the state has been successfully updated.
	 * @throws {Error} - Logs an error to the console if the network request fails.
	 *
	 * Upon successful response:
	 * - Updates the local persistent state with the new state.
	 * - Sets the persistent state key from the response.
	 * - Updates the expiration time of the state.
	 * - Updates the URL with the new key from the response.
	 */
	const handleChangePersistentState = async (newState: T) => {
		// call the route to change state in SQLite
		await fetch(`/api/stateStorage`, {
			method: 'POST',
			body: JSON.stringify(newState),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error('Editing Persistent State: Status Error');
				}

				// Parse the response to get the new state, key and expiration time
				const result = await response.json();

				// Update local state with the new values
				setPersistentState(newState);
				setPersistentStateKey(result.key);
				setExpiresAtState(result.expiresAt);

				// Update URL with the new key from the response
				const newUrl = new URL(window.location.href);
				newUrl.searchParams.set('key', result.key);
				window.history.pushState({}, '', newUrl);
				setError(null);
			})
			.catch((error) => {
				console.error('Edit Persistent State Error:', error.message);
				setError(error.message);
			});
	};

	// onload the component, read the state from SQLite by key in URL
	useEffect(() => {
		// Get the key from the URL
		const url = window.location.href;
		const urlParams = new URL(url).searchParams;

		// ... and set the key in the state
		// If the key is not in the URL, set it to null
		const initialKey = urlParams.get('key');
		setPersistentStateKey(initialKey || null);

		/**
		 * Asynchronously retrieves persistent state data from the server.
		 *
		 * @async
		 * @function handleReadPersistentState
		 * @param {string} initialPersistentStateKey - The key used to fetch the specific state data from the server.
		 * @returns {Promise<any>} The retrieved state data in JSON format.
		 * @throws {Error} Throws an error if the fetch request fails with a non-OK status.
		 * @description Fetches state data from the API endpoint. If a `persistentStateKey` is provided,
		 * it will be used as a query parameter to fetch specific state data. Otherwise, it fetches all state data.
		 */
		const handleReadPersistentState = async (initialPersistentStateKey: string) => {
			// Fetch the state from the server using the provided key from SQLite
			const fetchUrl = `/api/stateStorage?key=${initialPersistentStateKey}`;
			const response = await fetch(fetchUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// Check if the response status is not OK and throw an error
			if (!response.ok) {
				throw new Error('Fetch State: Status Error');

				// TODO: Add error handler here for the case when the state is not found
			}

			// Parse and return the SQLite route response as JSON
			const json = await response.json();
			return json;
		};

		/**
		 * Fetches persistent state data asynchronously.
		 *
		 * This function attempts to retrieve the persistent state using the `handleReadPersistentState` function
		 * with the provided key. If the data is successfully retrieved, it updates the persistent state key,
		 * state, and expiration time using their respective setter functions. If no data is found, the default
		 * state remains unchanged.
		 *
		 * @async
		 * @function fetchData
		 * @param {string} initialPersistentStateKey - The key used to fetch the specific state data from the server.
		 * @returns {Promise<void>} Resolves when the operation is complete.
		 * @throws {Error} Logs an error to the console and updates the error state if fetching fails.
		 */
		const fetchData = async (initialPersistentStateKey: string): Promise<void> => {
			try {
				// Get data from SQLite route
				const data: any | null = await handleReadPersistentState(initialPersistentStateKey);

				// No data found, keep the default state
				if (!data) return; // no data, keep defaults

				// If data is found, set the state and key
				setPersistentStateKey(data.key);
				setPersistentState(data.state);
				setExpiresAtState(data.expiresAt);
				setError(null); // Clear any previous errors
			} catch (error) {
				console.error('Persistent state load:', error);
				setError((error as Error).message);
			}
		};
		// If an initial key is present, fetches the corresponding persistent state data.
		if (initialKey) {
			fetchData(initialKey);
		}
	}, []);

	return {
		// The current key identifying the persisted state on the server
		key: persistentStateKey,

		// The current persisted state value
		state: persistentState as T,

		// The expiration time of the state (timestamp)
		expiresAt: expiresAtOfTheState,

		// A function to update the state on the server and locally
		setPersistentState: handleChangePersistentState,
		error, // Expose error state
		clearError: () => setError(null), // Provide a way to clear errors
	};
};
