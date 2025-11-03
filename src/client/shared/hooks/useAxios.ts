import {useState, useRef, useEffect} from 'react';
import axios, {AxiosRequestConfig} from 'axios';

/**
 * Options for configuring the `useAxios` hook.
 * @interface
 * @property {AxiosRequestConfig} [axiosConfig] - Optional Axios configuration object.
 * @property {'GET' | 'POST'} [method] - HTTP method to use for the request (default is 'GET').
 */
export interface UseAxiosOptions {
    axiosConfig?: AxiosRequestConfig;
    method?: 'GET' | 'POST';
}

/**
 * Return type of the `useAxios` hook.
 * @interface
 * @template T
 * @property {T | null} data - The response data from the Axios request, or null if no data is available.
 * @property {any | null} error - The error object if the request fails, or null if no error occurred.
 * @property {boolean} isLoading - Indicates whether the request is currently loading.
 * @property {boolean} isValidating - Indicates whether the request is currently being validated.
 */
export interface UseAxiosReturn<T> {
    data: T | null;
    error: any | null;
    isLoading: boolean;
    isValidating: boolean;
}

/**
 * A custom React hook for making Axios HTTP requests.
 *
 * @template T
 * @param {{ fetchUrl: string }} url - The URL configuration object containing the endpoint to fetch.
 * @param fetcher - Optional custom fetcher function for GET requests.
 * @param {any} [payload] - The payload to send with the request (used for POST requests).
 * @param {UseAxiosOptions} [options] - Optional configuration for the Axios request.
 * @returns {UseAxiosReturn<T>} - An object containing the response data, error, loading state, and validation state.
 *
 * @example
 *  const { data, error, isLoading, isValidating } = useAxios(
 *   { fetchUrl: '/api/data' },
 *   undefined,
 *   { method: 'POST', axiosConfig: { headers: { 'Content-Type': 'application/json' } } },
 *   { key: 'value' }
 *  );
 */
export function useAxios<T = unknown>(
    url: { fetchUrl: string },
    fetcher?: (url: string) => Promise<T>,
    payload?: unknown,
    options: UseAxiosOptions = {}
): UseAxiosReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // Ref to ensure the effect runs only once.
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        (async () => {
            setIsValidating(true);
            setIsLoading(true);
            setError(null);
            try {
                const method = (options.method ?? 'GET').toUpperCase() as 'GET' | 'POST';
                let responseData: T;
                if (method === 'GET') {
                    if (fetcher) {
                        responseData = await fetcher(url.fetchUrl);
                    } else {
                        responseData = (await axios.get<T>(url.fetchUrl, options.axiosConfig)).data;
                    }
                } else {
                    responseData = (await axios.post<T>(url.fetchUrl, payload, options.axiosConfig)).data;
                }

                setData(responseData);
            } catch (err) {
                setError(err);
            } finally {
                setIsValidating(false);
                setIsLoading(false);
            }
        })();
    }, [url.fetchUrl, fetcher, payload, options.method, options.axiosConfig]);

    return {data, error, isLoading, isValidating};
}
