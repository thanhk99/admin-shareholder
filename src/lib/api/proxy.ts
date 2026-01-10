import apiClient from "../api-client";
import { API_CONFIG } from "../api-config";
import { NonShareholderProxyRequest, NonShareholderProxyResponse, ProxyItem, ProxyRequest } from "@/app/types/proxy";

export default class ProxyService {
    // 6.1. Tạo ủy quyền
    static async createProxy(meetingId: string, data: ProxyRequest): Promise<ProxyItem> {
        try {
            return apiClient.post(`${API_CONFIG.ENDPOINTS.MEETING.BASE}/${meetingId}/proxy`, data);
        } catch (error) {
            throw error;
        }
    }

    // 6.2. Lấy danh sách ủy quyền của cuộc họp
    static async getMeetingProxies(meetingId: string): Promise<ProxyItem[]> {
        try {
            return apiClient.get(`${API_CONFIG.ENDPOINTS.MEETING.BASE}/${meetingId}/proxy`);
        } catch (error) {
            throw error;
        }
    }

    // 6.3. Lấy danh sách ủy quyền theo người uỷ quyền
    static async getProxiesByDelegator(meetingId: string, userId: string): Promise<ProxyItem[]> {
        try {
            return apiClient.get(`${API_CONFIG.ENDPOINTS.MEETING.BASE}/${meetingId}/proxy/delegator/${userId}`);
        } catch (error) {
            throw error;
        }
    }

    // 6.4. Lấy danh sách uỷ quyền theo người được uỷ quyền
    static async getProxiesByProxy(meetingId: string, userId: string): Promise<ProxyItem[]> {
        try {
            return apiClient.get(`${API_CONFIG.ENDPOINTS.MEETING.BASE}/${meetingId}/proxy/proxy/${userId}`);
        } catch (error) {
            throw error;
        }
    }

    // 6.5. Thu hồi ủy quyền
    static async revokeProxy(meetingId: string, delegationId: number) {
        try {
            return apiClient.post(`${API_CONFIG.ENDPOINTS.MEETING.BASE}/${meetingId}/proxy/${delegationId}/revoke`);
        } catch (error) {
            throw error;
        }
    }

    // 6.6. Thêm người được uỷ quyền (không phải cổ đông)
    static async createNonShareholderProxy(data: NonShareholderProxyRequest): Promise<NonShareholderProxyResponse> {
        try {
            return apiClient.post(API_CONFIG.ENDPOINTS.PROXY.REPRESENTATIVE, data);
        } catch (error) {
            throw error;
        }
    }

    // Deprecated methods
    static async getProxyPerson(investorCode: string) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.PROXY.PROXYPERSON}/${investorCode}`);
    }

    static async getProxyDelegates(investorCode: string) {
        return apiClient.get(`${API_CONFIG.ENDPOINTS.PROXY.PROXYDELEGATE}/${investorCode}`);
    }
}
