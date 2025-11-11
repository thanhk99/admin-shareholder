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
            REFRESH : '/api/auth/refreshAdmin',
            EXISTEMAIL: '/api/auth/existEmail'
        },
        ADMIN: {
            GETPBASEINFO: '/api/admin/getbase',
            GETBYCODE: '/api/shareholders/getByCode',
            UPDATE_PROFILE: '/api/shareholders/editShareholder',
            UPDATE_SHAREHOLDER_NAME: '/api/shareholders/changeName'
        },
        MEETING :{
            GETMEETINGALL: 'api/admin/meetings/getMeetings',
            CREATEMEETING: 'api/admin/meetings/create',
            UPDATEMEETING: 'api/admin/meetings/update',
            
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
        },
        SHAREHOLDER:{
            GETLIST:'/api/admin/shareholder/getAllShareholder',
            ADDSHAREHOLDER:'/api/admin/shareholder/addShareholder',
            GETSHAREHOLDERBYCODE :'/api/admin/shareholder/getShareholder',
            UPDATESHAREHOLDER : '/api/admin/shareholder/update'
        },
        DASHBOARD:{
            GETHOME:'/api/dashboard/home'
        },
        CANDIDATE:{
            GETBYMEETING: 'api/admin/candidate',
            CREATECANDIDATE:'api/admin/candidate/create',
            UPDATECANDIDATE:'api/admin/candidate/update',
            DISABLECANDIDATE:'api/admin/candidate/toggle',
            GETALLCANDIDATES:'api/admin/candidate'
        },
        RESOLUTION:{
            GETALLRESOLUTIONS: '/api/admin/resolutions',
            GETBYMEETING: '/api/admin/resolutions/meeting',
            CREATERESOLUTION: '/api/admin/resolutions/create',
            UPDATERESOLUTION: '/api/admin/resolutions/update',
            UPDATERESOLUTIONSTATUS: '/api/admin/resolutions/updateStatus',
        }
    }
}

export const KEY_CONFIG = {
    ACCESS_TOKEN_KEY:"accessToken",
    REFRESH_TOKEN_KEY: "refreshToken"

}
