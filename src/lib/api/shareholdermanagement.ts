import apiClient from "../api-client";
import { API_CONFIG } from "../api-config";
import { addShareholderRequest, updateShareholderRequest } from "@/app/types/shareholder";

export default class ShareholderManage {

    static api_get_list_shareholder: string = API_CONFIG.ENDPOINTS.SHAREHOLDER.GETLIST;
    static api_add_shareholder: string = API_CONFIG.ENDPOINTS.SHAREHOLDER.ADDSHAREHOLDER;
    static api_update_shareholde: string = API_CONFIG.ENDPOINTS.SHAREHOLDER.UPDATESHAREHOLDER;

    static async getList() {
        try {
            return apiClient.get(this.api_get_list_shareholder);
        } catch (error) {
            throw error
        }
    }

    static async addShareholder(addShareholderRequest: addShareholderRequest) {
        return apiClient.post(this.api_add_shareholder, addShareholderRequest);
    }

    static async updateShareholder(updateShareholder: updateShareholderRequest) {
        return apiClient.post(this.api_update_shareholde, updateShareholder);
    }

    static async getShareholderByCode(id: string) {
        try {
            return apiClient.get(this.api_get_list_shareholder + "/" + id);
        } catch (error) {
            throw error;
        }
    }

    static async getByInvestorCode(code: string) {
        return this.getShareholderByCode(code);
    }

    static async getLogs(shareholderCode: string, page: number) {
        try {
            return apiClient.get(API_CONFIG.ENDPOINTS.SHAREHOLDER.GETLOGS + "/" + shareholderCode, { params: { page } });
        } catch (error) {
            throw error;
        }
    }
}