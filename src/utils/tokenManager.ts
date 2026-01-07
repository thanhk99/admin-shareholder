let accessToken: string | null = null;

export const tokenManager = {
    getAccessToken: () => accessToken,
    setAccessToken: (token: string) => {
        accessToken = token;
    },
    clearAccessToken: () => {
        accessToken = null;
    }
};
