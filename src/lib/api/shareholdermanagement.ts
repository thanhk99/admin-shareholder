import axiosInstance from "../utils/axios";
import { API_CONFIG } from "../utils/constants";
import { addShareholderRequest } from "@/app/types/shareholder";
export default class ShareholderManage{

    static api_get_list_shareholder : string = API_CONFIG.ENDPOINTS.SHAREHOLDER.GETLIST;

    static async getList(){
        try {
            const response = await axiosInstance.get(this.api_get_list_shareholder);
            return response.data;
        } catch (error) {
            throw error
        }
    }

    static async addShareholder(addShareholderRequest:addShareholderRequest){
        const response = await axiosInstance.post("",addShareholderRequest);
        return response.data;
    }
}