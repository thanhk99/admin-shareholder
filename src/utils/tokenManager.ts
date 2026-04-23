import { KEY_CONFIG } from '@/lib/api-config';

let _accessToken: string | null = null;

export const tokenManager = {
    getAccessToken: () => {
        if (_accessToken) return _accessToken;
        if (typeof window !== 'undefined') {
            _accessToken = localStorage.getItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
            return _accessToken;
        }
        return null;
    },

    setAccessToken: (token: string) => {
        _accessToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem(KEY_CONFIG.ACCESS_TOKEN_KEY, token);
        }
    },

    getRefreshToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(KEY_CONFIG.REFRESH_TOKEN_KEY);
        }
        return null;
    },

    setRefreshToken: (token: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(KEY_CONFIG.REFRESH_TOKEN_KEY, token);
        }
    },

    clearTokens: () => {
        _accessToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
            localStorage.removeItem(KEY_CONFIG.REFRESH_TOKEN_KEY);
        }
    },

    clearAccessToken: () => {
        _accessToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
        }
    }
};
