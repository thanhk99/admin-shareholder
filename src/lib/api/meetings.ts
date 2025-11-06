import { API_CONFIG } from "../utils/constants";
import axiosInstance from "../utils/axios";
import { Meeting, MeetingRequest } from "@/app/types/meeting";

export class MeetingService{

    static api_get_all_meetings : string = API_CONFIG.ENDPOINTS.MEETING.GETMEETINGALL;
    static api_create_meetings : string = API_CONFIG.ENDPOINTS.MEETING.CREATEMEETING;
    static api_update_meetings : string = API_CONFIG.ENDPOINTS.MEETING.UPDATEMEETING;
    static getAllMeetings =async ()=>{
        try {
            const response = await axiosInstance.get(this.api_get_all_meetings);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static createMeeting = async (meeting : MeetingRequest) =>{
        try {
            const response = await axiosInstance.post(this.api_create_meetings,meeting);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static updateMeeting = async (meeting : MeetingRequest) =>{
        try {
            const response = await axiosInstance.post(this.api_update_meetings,meeting);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}