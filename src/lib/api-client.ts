import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '@/utils/tokenManager';
import { API_CONFIG } from './api-config';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

const apiClient = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = tokenManager.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response.data; // Flat structure
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (!originalRequest) return Promise.reject(error);

        const isAuthRequest = originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.LOGIN) ||
            originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.REFRESH) ||
            originalRequest.url?.includes(API_CONFIG.ENDPOINTS.AUTH.REGISTER);

        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && !isAuthRequest) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = 'Bearer ' + token;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data;
                tokenManager.setAccessToken(accessToken);

                apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                originalRequest.headers.Authorization = 'Bearer ' + accessToken;

                processQueue(null, accessToken);
                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                tokenManager.clearAccessToken();
                // Optional: Redirect to login or handle logout action
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
