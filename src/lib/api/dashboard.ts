import apiClient from '../api-client';
import { API_CONFIG } from '../api-config';
import { DashboardStatsResponse } from '@/app/types/dashboard';

export const DashboardService = {
    getSummary: async (): Promise<DashboardStatsResponse> => {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.SUMMARY);
            // Handle potential wrapped response based on previous patterns, though user said response IS the object.
            // But previous code in Dashboard.tsx checked for response.status === "success".
            // The user prompt said "Response (DashboardStatsResponse): {...}".
            // I'll assume direct response for now as per prompt, but keep an eye on it or use interceptor logic which returns data.
            return response.data || response;
        } catch (error) {
            throw error;
        }
    },

    // Keeping getHome for backward compatibility if needed, or remove if fully replacing.
    // The plan said "Replace existing dashboard home", so maybe I don't need getHome anymore, 
    // but I'll keep it to avoid breaking other things if they exist. 
    // Actually, the previous Dashboard.tsx used getHome. 
    getHome: async () => {
        try {
            const response = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.GETHOME);
            return response;
        } catch (error) {
            throw error;
        }
    }
};