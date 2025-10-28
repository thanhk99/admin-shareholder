import axiosInstance  from "../utils/axios";
import { API_CONFIG } from "../utils/constants";
import TokenService from "./token";

class AuthService{

    static apiLogin:string =API_CONFIG.ENDPOINTS.AUTH.LOGIN;
    static apiRefreshToken :string =API_CONFIG.ENDPOINTS.AUTH.REFRESH
    static aoiSignUp : string = API_CONFIG.ENDPOINTS.AUTH.SIGNUP

  static async login(account: string, password: string){
    const body= {
      account: account,
      password: password
    };
    
    try {
      const response = await axiosInstance.post(this.apiLogin, body);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken(){
      const refreshToken = await TokenService.getRefresh()
      if (!refreshToken) {
          throw new Error('No refresh token available');
      }
      
      const body = {
          refreshToken: refreshToken
      };
      
      try {
          const response = await axiosInstance.post(AuthService.apiRefreshToken, body, {
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          
          return response.data;
      } catch (error) {
          // console.error('Refresh token failed:', error.response?.status, error.response?.data);
          // throw error;
      }
  }
}

export default AuthService