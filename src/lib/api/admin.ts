import axiosInstance from "../utils/axios";
import { API_CONFIG } from "../utils/constants";

class AdminService{

    static apiGetInfo:string = API_CONFIG.ENDPOINTS.ADMIN.GETPBASEINFO;

    static async getBaseInfo(){
        try {
            const response = await axiosInstance.get(this.apiGetInfo);
            return response.data;
        } catch (error) {
            throw error ;
        }

    }
}

export default AdminService ; 