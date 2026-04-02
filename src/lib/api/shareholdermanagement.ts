import apiClient from "../api-client";
import { API_CONFIG } from "../api-config";
import { addShareholderRequest, updateShareholderRequest } from "@/app/types/shareholder";

export interface ResetPasswordResponse {
    newPassword: string;
}

export default class ShareholderManage {

    static api_get_list_shareholder: string = API_CONFIG.ENDPOINTS.SHAREHOLDER.GETLIST;
    static api_add_shareholder: string = API_CONFIG.ENDPOINTS.SHAREHOLDER.ADDSHAREHOLDER;
    static api_update_shareholde: string = API_CONFIG.ENDPOINTS.SHAREHOLDER.UPDATESHAREHOLDER;

    static async getList(page: number = 0, size: number = 10, keyword?: string) {
        try {
            const params: any = { page, size };
            if (keyword) params.keyword = keyword;
            return apiClient.get(this.api_get_list_shareholder, { params });
        } catch (error) {
            throw error
        }
    }

    static async getByMeetingId(meetingId: string) {
        try {
            return apiClient.get(`${API_CONFIG.ENDPOINTS.MEETING.SHAREHOLDERS}/${meetingId}/shareholders`);
        } catch (error) {
            throw error;
        }
    }

    static async addShareholder(addShareholderRequest: addShareholderRequest) {
        return apiClient.post(this.api_add_shareholder, addShareholderRequest);
    }

    static async updateShareholder(id: string, updateShareholder: updateShareholderRequest) {
        return apiClient.put(`${this.api_update_shareholde}/${id}`, updateShareholder);
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

    static async resetPassword(userId: string): Promise<ResetPasswordResponse> {
        try {
            return apiClient.post(`${API_CONFIG.ENDPOINTS.SHAREHOLDER.RESET_PASSWORD}/${userId}/reset-password`);
        } catch (error) {
            throw error;
        }
    }

    static async getUserVoteHistory(userId: string) {
        try {
            return apiClient.get(`${API_CONFIG.ENDPOINTS.ADMIN.GET_USER_VOTES}/${userId}/votes`);
        } catch (error) {
            throw error;
        }
    }

    static async getUserLoginHistory(userId: string) {
        try {
            return apiClient.get(`${API_CONFIG.ENDPOINTS.ADMIN.GET_USER_LOGIN_HISTORY}/${userId}/login-history`);
        } catch (error) {
            throw error;
        }
    }

    static async generateQrLogin(userId: string, expiresAt?: string) {
        try {
            return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.MAGIC_QR, { userId, expiresAt });
        } catch (error) {
            throw error;
        }
    }

    static async getExistingQrToken(userId: string) {
        try {
            return apiClient.get(`${API_CONFIG.ENDPOINTS.AUTH.MAGIC_QR_TOKEN}/${userId}`);
        } catch (error) {
            // It's acceptable for this to fail (404) if no token exists
            return null;
        }
    }

    static async searchUsers(keyword: string) {
        try {
            return apiClient.get(API_CONFIG.ENDPOINTS.SHAREHOLDER.SEARCH, { params: { keyword } });
        } catch (error) {
            throw error;
        }
    }
}