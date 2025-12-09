import axios, { type AxiosInstance } from 'axios';

const BASE_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json', 
    },
    validateStatus: (status) => status >= 200 && status < 500, 
});

API.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt_token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

API.interceptors.response.use(response => response, error => {
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        localStorage.removeItem('jwt_token');
    }
    return Promise.reject(error);
});

export default API;