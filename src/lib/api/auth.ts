import apiClient from "../api-client";
import { API_CONFIG } from "../api-config";

class AuthService {

  static apiLogin: string = API_CONFIG.ENDPOINTS.AUTH.LOGIN;
  static apiRefreshToken: string = API_CONFIG.ENDPOINTS.AUTH.REFRESH;
  static apiRegister: string = API_CONFIG.ENDPOINTS.AUTH.REGISTER;

  static async register(data: any) {
    try {
      const response = await apiClient.post(this.apiRegister, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async login(identifier: string, password: string) {
    const body = {
      identifier: identifier,
      password: password
    };

    try {
      const response = await apiClient.post(this.apiLogin, body);
      return response;
    } catch (error) {
      throw error;
    }
  }

  static async refreshToken() {
    try {
      const response = await apiClient.post(this.apiRefreshToken, {});
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService