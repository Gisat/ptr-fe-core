import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

export interface UseAxiosOptions {
    axiosConfig?: AxiosRequestConfig;
}

export interface UseAxiosReturn<T> {
    data: T | null;
    error: any | null;
    isLoading: boolean;
    isValidating: boolean;
    revalidate: () => Promise<void>;
}

/**
 * Custom React hook for fetching data using Axios or a custom fetcher.
 * @template T - Expected data type for the response.
 * @param url - The URL to fetch data from.
 * @param options - Optional settings including Axios config.
 * @param fetcher - Optional custom fetcher function.
 * @returns Object containing data, error state, and loading indicators.
 */

export function useAxios<T = unknown>(
    url: { fetchUrl: string },
    fetcher?: (url: string) => Promise<T>,
    options: UseAxiosOptions = {}
): UseAxiosReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    const fetchData = useCallback(async () => {
        setIsValidating(true);
        try {
            const result = fetcher
                ? await fetcher(url.fetchUrl)
                : await axios.get<T>(url.fetchUrl, options.axiosConfig).then(res => res.data);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsValidating(false);
            setIsLoading(false);
        }
    }, [url, options.axiosConfig, fetcher]);

    useEffect(() => {
        fetchData();
    }, []);

    return { data, error, isLoading, isValidating, revalidate: fetchData };
}