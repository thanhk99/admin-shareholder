import { API_CONFIG } from "../utils/constants";
import axiosInstance from "../utils/axios";

export default class ReportService {
    static api_get_all = API_CONFIG.ENDPOINTS.REPORT.GET_ALL;

    static getReportMeeting = async (meetingCode: string) => {
        try {
            const response = await axiosInstance.post(this.api_get_all, { meetingCode });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}