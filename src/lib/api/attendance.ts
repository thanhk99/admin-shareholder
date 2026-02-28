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
    shareholderCode?: string;
    fullName: string;
    cccd: string;
    dateOfIssue?: string;
    placeOfIssue?: string;
    phoneNumber?: string;
    email?: string;
    sharesOwned: number;
    attendingShares: number;
    receivedProxyShares: number;
    delegatedShares: number;
    totalShares: number;
    participationType: 'DIRECT' | 'PROXY';
    checkedInAt: string;
}

export interface ProxyAttendeeDTO {
    delegationId: number;
    sharesDelegated: number;
    proxyParticipant: AttendanceResponse;
}

export interface IncomingProxyDTO {
    delegationId: number;
    sharesDelegated: number;
    delegatorParticipant: AttendanceResponse;
}

export interface CheckInBundleResponse {
    shareholder: AttendanceResponse;
    outgoingProxies: ProxyAttendeeDTO[];
    incomingProxies: IncomingProxyDTO[];
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

    static getCheckInBundle = async (meetingId: string, keyword: string): Promise<CheckInBundleResponse> => {
        try {
            return await apiClient.get('api/attend/checkin-bundle', {
                params: { meetingId, keyword }
            });
        } catch (error) {
            throw error;
        }
    }
}
