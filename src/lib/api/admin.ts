import apiClient from "../api-client";
import { API_CONFIG } from "../api-config";

class AdminService {

    static apiGetInfo: string = API_CONFIG.ENDPOINTS.ADMIN.GETPBASEINFO;

    static async getBaseInfo(): Promise<any> {
        try {
            return apiClient.get(this.apiGetInfo);
        } catch (error) {
            throw error;
        }
    }

    static async updateRoles(id: string, roles: string[]): Promise<any> {
        try {
            return apiClient.put(`${API_CONFIG.ENDPOINTS.ADMIN.UPDATE_ROLES}/${id}/roles`, roles);
        } catch (error) {
            throw error;
        }
    }
}

export default AdminService;