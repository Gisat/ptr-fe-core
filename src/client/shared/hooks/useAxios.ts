import {useEffect, useState, useCallback} from 'react';
import axios, {AxiosRequestConfig} from 'axios';

/**
 * Props for the useAxios hook.
 * @property axiosConfig - Additional Axios request configuration
 */
export interface UseAxiosOptions {
    axiosConfig?: AxiosRequestConfig;
}

/**
 * Return type for the useAxios hook.
 * @template T - Expected data type for the response.
 * @property data - The fetched data or null if not yet set.
 * @property error - Error object or null if no error.
 * @property isLoading - True while performing the initial fetch.
 * @property isValidating - True while any fetch (initial or manual) is in progress.
 * @property revalidate - Function to manually re-fetch data.
 */
export interface UseAxiosReturn<T> {
    data: T | null;
    error: any | null;
    isLoading: boolean;
    isValidating: boolean;
    revalidate: () => Promise<void>;
}

/**
 * Custom React hook for fetching data using Axios once on component mount.
 * @template T - Expected data type for the response.
 * @param url - The URL to fetch data from.
 * @param options - Optional settings including Axios config.
 * @returns Object containing data, error state, and loading indicators.
 */
export function useAxios<T = unknown>(
    url: { fetchUrl: string },
    options: UseAxiosOptions = {}
): UseAxiosReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);

    const fetchData = useCallback(async () => {
        setIsValidating(true);
        try {
            const response = await axios.get<T>(url.fetchUrl, options.axiosConfig);
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsValidating(false);
            setIsLoading(false);
        }
    }, [url, options.axiosConfig]);    // Re-create fetchData if URL or config change

    // Automatically fetch data once when the component mounts
    useEffect(() => {
        fetchData();                     // Trigger fetch on mount
        // Empty dependency array ensures this runs only once
    }, []);
    return {data, error, isLoading, isValidating, revalidate: fetchData};
}
