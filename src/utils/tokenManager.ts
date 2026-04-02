import { KEY_CONFIG } from '@/lib/api-config';

let accessToken: string | null = null;

export const tokenManager = {
    getAccessToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
        }
        return accessToken;
    },
    setAccessToken: (token: string) => {
        accessToken = token;
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
        accessToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
            localStorage.removeItem(KEY_CONFIG.REFRESH_TOKEN_KEY);
        }
    },
    clearAccessToken: () => {
        accessToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
        }
    }
};
