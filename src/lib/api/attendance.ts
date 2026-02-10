import { API_CONFIG } from "../api-config";
import apiClient from "../api-client";

export interface AttendanceRequest {
    meetingId: string;
    investorCode: string;
    attendingShares: number;
    participationType: 'DIRECT' | 'PROXY';
}

export interface AttendanceResponse {
    userId: string;
    meetingId: string;
    investorCode: string;
    fullName: string;
    cccd: string;
    sharesOwned: number;
    attendingShares: number;
    receivedProxyShares: number;
    delegatedShares: number;
    totalShares: number;
    participationType: 'DIRECT' | 'PROXY';
    checkedInAt: string;
}

export class AttendanceService {
    static api_register = API_CONFIG.ENDPOINTS.ATTENED.REGISTER;
    static api_attended = API_CONFIG.ENDPOINTS.ATTENED.ISATTENDED;

    static registerAttendance = async (request: AttendanceRequest): Promise<AttendanceResponse> => {
        try {
            return await apiClient.post(this.api_register, request);
        } catch (error) {
            throw error;
        }
    }

    static getAttendedParticipants = async (meeting_id: string): Promise<AttendanceResponse[]> => {
        try {
            return await apiClient.get(this.api_attended, {
                params: { meetingId: meeting_id }
            });
        } catch (error) {
            throw error;
        }
    }
}
