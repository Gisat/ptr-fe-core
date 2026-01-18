import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Options for configuring the `useAxios` hook.
 */
export interface UseAxiosOptions {
	axiosConfig?: AxiosRequestConfig;
	method?: 'GET' | 'POST';
	/** If true, the request will not be executed. */
	skip?: boolean;
}

export interface UseAxiosReturn<T> {
	data: T | null;
	error: any | null;
	isLoading: boolean;
	isValidating: boolean;
}

/**
 * A custom React hook for making Axios HTTP requests.
 * Now supports a `skip` option to conditionally prevent execution.
 */
export function useAxios<T = unknown>(
	url: { fetchUrl: string | undefined | null },
	fetcher?: (url: string) => Promise<T>,
	payload?: unknown,
	options: UseAxiosOptions = {}
): UseAxiosReturn<T> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<any | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isValidating, setIsValidating] = useState(false);

	// Extract variables for the dependency array to prevent unnecessary re-runs
	const { skip, method: optMethod, axiosConfig } = options;
	const fetchUrl = url.fetchUrl;

	useEffect(() => {
		// 1. If skip is true or fetchUrl is missing, reset state and do nothing
		if (skip || !fetchUrl) {
			setIsLoading(false);
			setIsValidating(false);
			return;
		}

		const fetchData = async () => {
			setIsValidating(true);
			setIsLoading(true);
			setError(null);

			try {
				const method = (optMethod ?? 'GET').toUpperCase() as 'GET' | 'POST';
				let responseData: T;

				if (method === 'GET') {
					if (fetcher) {
						responseData = await fetcher(fetchUrl);
					} else {
						responseData = (await axios.get<T>(fetchUrl, axiosConfig)).data;
					}
				} else {
					// POST request
					responseData = (await axios.post<T>(fetchUrl, payload, axiosConfig)).data;
				}

				setData(responseData);
			} catch (err) {
				setError(err);
			} finally {
				setIsValidating(false);
				setIsLoading(false);
			}
		};

		fetchData();
	}, [fetchUrl, fetcher, JSON.stringify(payload), optMethod, JSON.stringify(axiosConfig), skip]);

	return { data, error, isLoading, isValidating };
}
