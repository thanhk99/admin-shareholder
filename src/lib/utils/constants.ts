//API Constants 
export const API_CONFIG = {
    // BASE_URL : "https://remarkably-arriving-imp.ngrok-free.app",
    BASE_URL : "http://localhost:8085",
    TIMEOUT: 10000,
    ENDPOINTS: { 
        AUTH: {
            LOGIN: '/api/auth/login',
            SIGNUP : '/api/auth/signup',
            LOGOUT :'/api/auth/logout',
            REFRESH : '/api/auth/refresh',
            EXISTEMAIL: '/api/auth/existEmail'
        },
        ADMIN: {
            GETPBASEINFO: '/api/admin/getbase',
            GETBYCODE: '/api/shareholders/getByCode',
            UPDATE_PROFILE: '/api/shareholders/editShareholder',
            UPDATE_SHAREHOLDER_NAME: '/api/shareholders/changeName'
        },
        MEETING :{
            GETMEETINGPENDING: 'api/meetings/getAllPending',
            GETCANDIDATES: '/api/meetings/getCandidate',
            GETRESOLUTION: '/api/meetings/getResolution',
            GETCANDIDATEVOTE: '/api/meetings/getCandidateVoted',
            GETRESOLUTIONVOTE:'/api/meetings/getVoteResolution',
            VOTERESOLUTION:'api/meetings/voteResolution',
            VOTECANDIDATE:'/api/meetings/voteCandidate'
            
        },
        ATTENED: {
            REGISTER:'api/attend/regis',
            ISATTENDED:'api/attend/attended'
        },
        PROXY: {
            PROXYPERSON: '/api/proxy/proxyPerson',
            PROXYDELEGATE: '/api/proxy/proxyDelegate',
            PROXYLIST:'/api/proxy/listProxy',
            CANCLEPROXY: '/api/proxy/cancle'
        },
        PASSWORD: {
            CHANGEPASSWORD:'/api/auth/changePassword'
        }
    }
}

export const KEY_CONFIG = {
    ACCESS_TOKEN_KEY:"accessToken",
    REFRESH_TOKEN_KEY: "refreshToken"
}