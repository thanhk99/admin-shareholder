import axios from 'axios';
import { ResolutionFormData } from '@/app/types/resolution';
import { API_CONFIG } from '../utils/constants';

class ResolutionService {

    static API_GET_RESOLUTION_BYMEETING : string = API_CONFIG.ENDPOINTS.RESOLUTION.GETBYMEETING;

  async getResolutionByMeeting(meetingCode: string) {
    const response = await axios.get(this.API_GET_RESOLUTION_BYMEETING+"/"+`${meetingCode}`);
    return response.data;
  }

  async createResolution(resolutionData: ResolutionFormData & { meetingCode: string }) {
    const response = await axios.post(`${API_BASE_URL}/resolutions`, resolutionData);
    return response.data;
  }

  async updateResolution(resolutionData: ResolutionFormData) {
    const response = await axios.put(`${API_BASE_URL}/resolutions/${resolutionData.id}`, resolutionData);
    return response.data;
  }

  async deleteResolution(id: string) {
    const response = await axios.delete(`${API_BASE_URL}/resolutions/${id}`);
    return response.data;
  }

  async updateResolutionStatus(id: string, status: string) {
    const response = await axios.patch(`${API_BASE_URL}/resolutions/${id}/status`, { status });
    return response.data;
  }

  async startVoting(id: string) {
    const response = await axios.post(`${API_BASE_URL}/resolutions/${id}/start-voting`);
    return response.data;
  }

  async endVoting(id: string) {
    const response = await axios.post(`${API_BASE_URL}/resolutions/${id}/end-voting`);
    return response.data;
  }
}

export default new ResolutionService();