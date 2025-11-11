import { API_CONFIG } from '../utils/constants';
import axiosInstance from '../utils/axios';
import { ResolutionFormData } from '@/app/types/resolution';

export class ResolutionService {

  static api_get_resolution_by_meeting : string = API_CONFIG.ENDPOINTS.RESOLUTION.GETBYMEETING;
  static api_get_all_resolutions : string = API_CONFIG.ENDPOINTS.RESOLUTION.GETALLRESOLUTIONS;
  static api_create_resolution : string = API_CONFIG.ENDPOINTS.RESOLUTION.CREATERESOLUTION;
  static api_update_resolution : string = API_CONFIG.ENDPOINTS.RESOLUTION.UPDATERESOLUTION;
  static api_update_resolution_status : string = API_CONFIG.ENDPOINTS.RESOLUTION.UPDATERESOLUTIONSTATUS;

  static getAllResolutions = async ()=> {
    try {
      const response = await axiosInstance.get(this.api_get_all_resolutions);
      return response.data;
    } catch (error) {
      throw error;
    }

  }

  static getResolutionByMeeting = async (meetingCode: string) => {
    try {
      const response = await axiosInstance.get(`${this.api_get_resolution_by_meeting}/${meetingCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static createResolution = async (resolutionData: ResolutionFormData ) => {
    try {
      const response = await axiosInstance.post(this.api_create_resolution, resolutionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static updateResolution = async (resolutionData: ResolutionFormData) => {
    try {
      const response = await axiosInstance.post(this.api_update_resolution, resolutionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  } 

  static updateResolutionStatus = async (id: string, status: boolean) => {
    try {
      const response = await axiosInstance.post(this.api_update_resolution_status, {
        resolutionCode: id,
        isActive: status
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}
