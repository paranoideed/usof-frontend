import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const t = Cookies.get('accessToken') || Cookies.get('token');
    if (t) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
});
