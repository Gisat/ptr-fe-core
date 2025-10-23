import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

export interface UseAxiosOptions {
    axiosConfig?: AxiosRequestConfig;
}

export interface UseAxiosPostReturn<T, D = any> {
    data: T | null;
    error: any | null;
    isLoading: boolean;
    isValidating: boolean;
    postData: (payload?: D) => Promise<void>;
}

/**
 * Custom React hook for sending POST requests using Axios or a custom fetcher.
 * @template T - Expected response data type.
 * @template D - Payload (request body) data type.
 * @param url - The URL to send data to.
 * @param options - Optional settings including Axios config.
 * @returns Object containing response data, error state, loading indicators, and the postData function.
 */
export function useAxiosPost<T = unknown, D = any>(
    url: { fetchUrl: string },
    options: UseAxiosOptions = {}
): UseAxiosPostReturn<T, D> {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    const postData = useCallback(async (payload?: D) => {
        setIsLoading(true);
        setIsValidating(true);
        try {
            const response = await axios.post<T>(url.fetchUrl, payload, options.axiosConfig);
            setData(response.data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
            setIsValidating(false);
        }
    }, [url, options.axiosConfig]);

    return { data, error, isLoading, isValidating, postData };
}