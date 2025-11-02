import axiosInstance from "../utils/axios";
import { API_CONFIG } from "../utils/constants";

export class DashboardService{

    static api_get_home :string =API_CONFIG.ENDPOINTS.DASHBOARD.GETHOME;

    static async getHome(){
        try {
            const response =  await axiosInstance.get(this.api_get_home);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}