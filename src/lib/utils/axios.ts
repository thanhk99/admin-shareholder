import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AuthService from '../api/auth';
import TokenService from '../api/token';
import { API_CONFIG } from './constants';

const access_token_key = "accessToken"; 
let isRefreshing = false;

// Tạo event emitter đơn giản để thông báo khi token được refresh
const tokenRefreshEvents = {
  listeners: [] as (() => void)[],
  addListener(callback: () => void) {
    this.listeners.push(callback);
  },
  removeListener(callback: () => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  },
  emit() {
    this.listeners.forEach(listener => listener());
  }
};

export const onTokenRefreshed = (callback: () => void) => {
  tokenRefreshEvents.addListener(callback);
  return () => tokenRefreshEvents.removeListener(callback);
};

const clearAuthData = () => {
  TokenService.clearToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Access-Control-Allow-Origin': '*' 
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(access_token_key); 
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 403 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await AuthService.refreshToken();
        TokenService.setToken(response.data.accessToken, response.data.refreshToken);
        
        // Thông báo cho tất cả listeners biết token đã được refresh
        tokenRefreshEvents.emit();
        
        // Retry request gốc
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        clearAuthData();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          clearAuthData();
          break;
        case 404:
          console.error('Resource not found');
          break;
        default:
          console.error('Server error:', error.response.status);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;