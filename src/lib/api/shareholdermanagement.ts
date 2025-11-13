import axiosInstance from "../utils/axios";
import { API_CONFIG } from "../utils/constants";
import { addShareholderRequest, updateShareholderRequest } from "@/app/types/shareholder";
export default class ShareholderManage{

    static api_get_list_shareholder : string = API_CONFIG.ENDPOINTS.SHAREHOLDER.GETLIST;
    static api_add_shareholder : string = API_CONFIG.ENDPOINTS.SHAREHOLDER.ADDSHAREHOLDER;
    static api_get_shareholderBycode : string =API_CONFIG.ENDPOINTS.SHAREHOLDER.GETSHAREHOLDERBYCODE;
    static api_update_shareholde : string =API_CONFIG.ENDPOINTS.SHAREHOLDER.UPDATESHAREHOLDER;
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
        const response = await axiosInstance.post(this.api_update_shareholde,updateShareholder);
        return response.data;
    }

    static async getShareholderByCode(id:string){
        try {
            const response = await axiosInstance.post(this.api_get_shareholderBycode,id);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static async getLogs(shareholderCode: string, page: number) {
        try {
          const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.SHAREHOLDER.GETLOGS+"/"+shareholderCode, { params: { page } });
          return response.data;
        } catch (error) {
          throw error;
        }
    }   
}