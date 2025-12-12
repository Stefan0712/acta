import axios, { type AxiosInstance } from 'axios';

const BASE_URL: string = import.meta.env.VITE_API_URL;
const API: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json', 
    },
    validateStatus: (status) => status >= 200 && status < 500, 
});

API.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt-token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

API.interceptors.response.use(response => response, error => {
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        localStorage.removeItem('jwt-token');
    }
    return Promise.reject(error);
});

export default API;