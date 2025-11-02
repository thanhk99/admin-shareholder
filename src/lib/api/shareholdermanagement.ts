import axiosInstance from "../utils/axios";
import { API_CONFIG } from "../utils/constants";
import { addShareholderRequest, updateShareholderRequest } from "@/app/types/shareholder";
export default class ShareholderManage{

    static api_get_list_shareholder : string = API_CONFIG.ENDPOINTS.SHAREHOLDER.GETLIST;
    static api_add_shareholder : string = API_CONFIG.ENDPOINTS.SHAREHOLDER.ADDSHAREHOLDER;
    
    static async getList(){
        try {
            const response = await axiosInstance.get(this.api_get_list_shareholder);
            return response.data;
        } catch (error) {
            throw error
        }
    }

    static async addShareholder(addShareholderRequest:addShareholderRequest){
        const response = await axiosInstance.post(this.api_add_shareholder,addShareholderRequest);
        return response.data;
    }

    static async updateShareholder(updateShareholder:updateShareholderRequest){
        const response = await axiosInstance.post(this.api_add_shareholder,updateShareholder);
        return response.data;
    }
}