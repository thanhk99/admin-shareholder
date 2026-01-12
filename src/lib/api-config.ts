import { env } from "@/schemas/env";

export const API_CONFIG = {
    // BASE_URL: env.NEXT_PUBLIC_API_URL,
    BASE_URL: "http://localhost:8085",
    // BASE_URL: "http://dhcd.vix.local:8085",
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/api/auth/login',
            REGISTER: '/api/auth/register',
            LOGOUT: '/api/auth/logout',
            REFRESH: '/api/auth/refresh',
            EXISTEMAIL: '/api/auth/existEmail',
            MAGIC_QR: '/api/auth/qr/generate',
            MAGIC_QR_TOKEN: '/api/auth/qr/token'
        },
        ADMIN: {
            GETPBASEINFO: '/api/users/profile',
            UPDATE_PROFILE: '/api/shareholders/editShareholder',
            UPDATE_SHAREHOLDER_NAME: '/api/shareholders/changeName',
            UPDATE_ROLES: '/api/users',
            GET_USER_VOTES: '/api/users',
            GET_USER_LOGIN_HISTORY: '/api/users',
        },
        MEETING: {
            BASE: '/api/meetings',
            BY_ID: '/api/meetings'
        },
        ATTENED: {
            REGISTER: '/api/attend/regis',
            ISATTENDED: '/api/attend/attended'
        },
        PROXY: {
            CREATE: '/api/meetings',
            PROXYPERSON: '/api/proxy/proxyPerson',
            PROXYDELEGATE: '/api/proxy/proxyDelegate',
            PROXYLIST: '/api/proxy/listProxy',
            CANCLEPROXY: '/api/proxy/cancle',
            REPRESENTATIVE: '/api/representatives'
        },
        PASSWORD: {
            CHANGEPASSWORD: '/api/auth/changePassword'
        },
        SHAREHOLDER: {
            GETLIST: '/api/users',
            ADDSHAREHOLDER: '/api/users',
            UPDATESHAREHOLDER: '/api/users',
            GETLOGS: '/api/users',
            RESET_PASSWORD: '/api/users'
        },
        DASHBOARD: {
            GETHOME: '/api/dashboard/home',
            SUMMARY: '/api/dashboard/summary'
        },
        VOTING: {
            ITEMS: '/api/resolutions',
            ADD_CANDIDATE: '/api/resolutions',
            RESULTS: '/api/resolutions'
        },
        REPORT: {
            GET_ALL: '/api/admin/reports/getReportMeeting'
        }
    }
}

export const KEY_CONFIG = {
    ACCESS_TOKEN_KEY: "accessToken",
    REFRESH_TOKEN_KEY: "refreshToken"
}
