export default class TokenService{

    static ACCESS_TOKEN_KEY = "accessToken";
    static REFRESH_TOKEN_KEY = "refreshToken";

    static async setToken(access:string, refresh:string){
        localStorage.setItem(this.ACCESS_TOKEN_KEY,access)
        localStorage.setItem(this.REFRESH_TOKEN_KEY,refresh)
    }

    static async clearToken(){
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }

    static async getRefresh() : Promise<string | null>{
        const token = localStorage.getItem(this.REFRESH_TOKEN_KEY);
        return token;
    }

    static async getAccess(){
        const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
        return token;
    }

    static isLogin(){
        if( localStorage.getItem(this.ACCESS_TOKEN_KEY) === null ||localStorage.getItem(this.ACCESS_TOKEN_KEY)  === ""){
            return false;
        }else{
            return true;
        }
    }
}