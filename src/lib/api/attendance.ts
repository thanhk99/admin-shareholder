import apiClient from "../api-client";
import { API_CONFIG } from "../api-config";

export enum ParticipationType {
    DIRECT = 'DIRECT',
    PROXY = 'PROXY'
}

export interface AttendanceRequest {
    meetingId: string;
    investorCode: string;
    attendingShares: number;
    participationType: ParticipationType;
}

export interface AttendanceResponse {
    meetingId: string;
    userId: string;
    investorCode: string;
    cccd: string;
    fullName: string;
    sharesOwned: number;
    attendingShares: number;
    receivedProxyShares: number;
    delegatedShares: number;
    totalShares: number;
    participationType: ParticipationType;
    status: string;
    checkedInAt: string | null;
}

export class AttendanceService {
    static async register(request: AttendanceRequest): Promise<AttendanceResponse> {
        try {
            return apiClient.post(API_CONFIG.ENDPOINTS.ATTENED.REGISTER, request);
        } catch (error) {
            throw error;
        }
    }

    static async getAttendedList(meetingId: string): Promise<AttendanceResponse[]> {
        try {
            return apiClient.get(API_CONFIG.ENDPOINTS.ATTENED.ISATTENDED, {
                params: { meetingId }
            });
        } catch (error) {
            throw error;
        }
    }
}
