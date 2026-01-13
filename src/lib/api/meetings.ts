import { API_CONFIG } from "../api-config";
import apiClient from "../api-client";
import { MeetingRequest, MeetingStatus } from "@/app/types/meeting";

export class MeetingService {
    static api_base = API_CONFIG.ENDPOINTS.MEETING.BASE;
    static api_by_id = API_CONFIG.ENDPOINTS.MEETING.BY_ID;

    static getAllMeetings = async () => {
        try {
            return apiClient.get(this.api_base);
        } catch (error) {
            throw error;
        }
    }

    static getMeetingById = async (id: string) => {
        try {
            return apiClient.get(`${this.api_by_id}/${id}`);
        } catch (error) {
            throw error;
        }
    }

    static createMeeting = async (meeting: MeetingRequest) => {
        try {
            return apiClient.post(this.api_base, meeting);
        } catch (error) {
            throw error;
        }
    }

    static updateMeeting = async (id: string, meeting: MeetingRequest) => {
        try {
            return apiClient.put(`${this.api_by_id}/${id}`, meeting);
        } catch (error) {
            throw error;
        }
    }

    static updateStatus = async (id: string, status: MeetingStatus) => {
        try {
            return apiClient.patch(`${this.api_by_id}/${id}/status`, null, {
                params: { status }
            });
        } catch (error) {
            throw error;
        }
    }

    static deleteMeeting = async (id: string) => {
        try {
            return apiClient.delete(`${this.api_by_id}/${id}`);
        } catch (error) {
            throw error;
        }
    }

    static getVotingItems = async (meetingId: string) => {
        try {
            return apiClient.get(`${this.api_base}/${meetingId}/voting-items`);
        } catch (error) {
            throw error;
        }
    }

    static getOngoingMeeting = async () => {
        try {
            return apiClient.get(`${this.api_base}/ongoing`);
        } catch (error) {
            throw error;
        }
    }

    static getRealtimeStatus = async (meetingId: string) => {
        try {
            return apiClient.get(`${this.api_by_id}/${meetingId}/realtime`);
        } catch (error) {
            throw error;
        }
    }
}