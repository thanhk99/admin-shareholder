import { KEY_CONFIG } from '@/lib/api-config';

let accessToken: string | null = null;

export const tokenManager = {
    getAccessToken: () => {
        if (typeof window !== 'undefined') {
            const localToken = localStorage.getItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
            if (localToken) {
                return localToken;
            }
        }
        return accessToken;
    },
    setAccessToken: (token: string) => {
        accessToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem(KEY_CONFIG.ACCESS_TOKEN_KEY, token);
        }
    },
    clearAccessToken: () => {
        accessToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem(KEY_CONFIG.ACCESS_TOKEN_KEY);
        }
    }
};
