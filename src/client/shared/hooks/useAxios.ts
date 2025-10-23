import {useEffect, useState, useCallback} from 'react';
import axios, {AxiosRequestConfig} from 'axios';

export interface UseAxiosOptions {
    axiosConfig?: AxiosRequestConfig;
    method?: 'GET' | 'POST';
}

export interface UseAxiosReturn<T, D = any> {
    data: T | null;
    error: any | null;
    isLoading: boolean;
    isValidating: boolean;
    request: (payload?: D) => Promise<void>;
}


/**
 * A custom React hook for making HTTP requests using Axios.
 *
 * @template T - The type of the response data.
 * @template D - The type of the request payload (default: `any`).
 *
 * @param {Object} url - An object containing the URL to fetch data from.
 * @param {string} url.fetchUrl - The URL endpoint for the request.
 * @param {Function} [fetcher] - An optional custom fetcher function that takes a URL and returns a Promise resolving to the response data.
 * @param {UseAxiosOptions} [options] - Optional configuration for the Axios request.
 * @param {AxiosRequestConfig} [options.axiosConfig] - Additional Axios configuration options.
 * @param {'GET' | 'POST'} [options.method='GET'] - The HTTP method to use for the request.
 *
 * @example calling post from apps: const { data, error, isLoading, request } = useAxios<ApiResponse, { name: string; email: string }>(
 *     { fetchUrl: '/api/users' },
 *     { method: 'POST' }
 *   )
 *   OR without header: const { data, error, isLoading, request } = useAxios(
 *     { fetchUrl: '/api/users' },
 *     { method: 'POST' }
 *   ) a then: await request({ name: 'John', email: 'john@example.com' });
 * @returns {UseAxiosReturn<T, D>} - An object containing the response data, error, loading states, and a request function.
 */
export function useAxios<T = unknown, D = any>(
    url: { fetchUrl: string },
    fetcher?: (url: string) => Promise<T>,
    options: UseAxiosOptions = {}
): UseAxiosReturn<T, D> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    // Determine the HTTP method, defaulting to 'GET'
    const method = (options.method ?? 'GET').toUpperCase() as 'GET' | 'POST';

    const request = useCallback(async (payload?: D) => {
        setIsLoading(true);
        setIsValidating(true);

        try {
            let result: T;

            if (method === 'GET') {
                result = fetcher
                    ? await fetcher(url.fetchUrl)
                    : await axios.get<T>(url.fetchUrl, options.axiosConfig).then(res => res.data);
            } else {
                //Fetcher does not use in POST method
                result = await axios.post<T>(url.fetchUrl, payload, options.axiosConfig).then(res => res.data);
            }

            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsValidating(false);
            setIsLoading(false);
        }
    }, [method, url, options.axiosConfig, fetcher]);

    useEffect(() => {
        if (method === 'GET') {
            request();
        }
    }, [method, request]);

    return {data, error, isLoading, isValidating, request };
}