import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Props for the useAxios hook.
 * @property fetchUrl - The URL to fetch data from.
 */
export interface UseAxiosProps {
    fetchUrl: string;

}

/**
 * Custom React hook for fetching data using Axios.
 *
 * @template T - The expected response data type.
 * @param props - The properties for the hook.
 * @returns An object containing the fetched data and any error encountered.
 *
 * @example
 * const { data, error } = useAxios<{ name: string }>({ fetchUrl: '/api/user' });
 */
export const useAxios = <T = unknown>({
                                           fetchUrl
                                       }: UseAxiosProps) :{data: T | null, error: any | null} => {

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<any | null>(null);


    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(fetchUrl);
                const responseData = response.data as T;
                setData(responseData);

            } catch (err) {
                setError(err);
                console.error("Error fetching data:", err);
            }

        }
         fetchData()
        }, []);

    return { data, error };
};
