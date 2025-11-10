import { API_CONFIG } from "../utils/constants";
import axiosInstance from "../utils/axios";
import { CandidateFormData } from "@/app/types/candidate";

export default class CandidateService{

    static api_get_candidate_meeting : string = API_CONFIG.ENDPOINTS.CANDIDATE.GETBYMEETING;
    static api_create_candidate: string = API_CONFIG.ENDPOINTS.CANDIDATE.CREATECANDIDATE;
    static api_update_candidate:string = API_CONFIG.ENDPOINTS.CANDIDATE.UPDATECANDIDATE;
    static api_disable_candidate : string =API_CONFIG.ENDPOINTS.CANDIDATE.DISABLECANDIDATE;
    static api_get_all_candidates : string = API_CONFIG.ENDPOINTS.CANDIDATE.GETALLCANDIDATES;

    static getCandidateMeeting = async (meetingCode:string)=>{
        try {
            const response = await axiosInstance.get(this.api_get_candidate_meeting+"/"+meetingCode)
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static createCandidate = async(candidateFormData: CandidateFormData) =>{
        try {
            const response = await axiosInstance.post(this.api_create_candidate,candidateFormData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    static updateCandidate = async(candidateFormData: CandidateFormData) =>{
        try {
            const response = await axiosInstance.post(this.api_update_candidate,candidateFormData);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    static toggleCandidateStatus = async(id:string,meetingCode:string) =>{
        try {
            const body ={
                id:id,
                meetingCode:meetingCode
            }
            const response = await axiosInstance.post(this.api_disable_candidate,body);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    static getAllCandidates = async () =>{
        try {
            const response = await axiosInstance.get(this.api_get_all_candidates);
            return response.data;
        } catch (error) {
            throw error;
        }
    }


}