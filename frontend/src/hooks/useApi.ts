import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';

const useApi = <T>(url: string, config?: AxiosRequestConfig) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<T>(url, config);
                setData(response.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, config]);

    return { data, error, loading };
};

export default useApi;