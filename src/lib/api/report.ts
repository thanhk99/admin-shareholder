import { API_CONFIG } from "../api-config";
import apiClient from "../api-client";

export default class ReportService {
    static api_get_all = API_CONFIG.ENDPOINTS.REPORT.GET_ALL;
    static api_voting_stats = API_CONFIG.ENDPOINTS.REPORT.VOTING_STATS;

    static getReportMeeting = async (meetingCode: string) => {
        try {
            return apiClient.post(this.api_get_all, { meetingCode });
        } catch (error) {
            throw error;
        }
    }

    static getVotingStats = async (meetingId: string) => {
        try {
            return apiClient.get(this.api_voting_stats, { params: { meetingId } });
        } catch (error) {
            throw error;
        }
    }
}