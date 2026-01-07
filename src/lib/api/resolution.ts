import { API_CONFIG } from '../api-config';
import apiClient from "../api-client";
import { VotingItemRequest } from '@/app/types/resolution';

export class ResolutionService {

  static getResolutionsByMeetingId = async (meetingId: string) => {
    try {
      return apiClient.get(`/api/meetings/${meetingId}/resolutions`);
    } catch (error) {
      throw error;
    }
  }

  static getResolutionById = async (resolutionId: string) => {
    try {
      return apiClient.get(`/api/resolutions/${resolutionId}`);
    } catch (error) {
      throw error;
    }
  }

  static getOptionById = async (optionId: string) => {
    try {
      return apiClient.get(`/api/options/${optionId}`);
    } catch (error) {
      throw error;
    }
  }

  static updateOption = async (optionId: string, data: any) => {
    try {
      return apiClient.put(`/api/options/${optionId}`, data);
    } catch (error) {
      throw error;
    }
  }

  static deleteOption = async (optionId: string) => {
    try {
      return apiClient.delete(`/api/options/${optionId}`);
    } catch (error) {
      throw error;
    }
  }

  static createResolution = async (meetingId: string, data: Partial<VotingItemRequest>) => {
    try {
      // Chỉ gửi các trường theo spec mới 4.1 cho Resolution
      const payload = {
        title: data.title,
        description: data.description,
        displayOrder: data.displayOrder
      };
      return apiClient.post(`/api/meetings/${meetingId}/resolutions`, payload);
    } catch (error) {
      throw error;
    }
  }

  static getResults = async (resolutionId: string) => {
    try {
      return apiClient.get(`/api/resolutions/${resolutionId}/results`);
    } catch (error) {
      throw error;
    }
  }

  static vote = async (resolutionId: string, voteData: any) => {
    try {
      // payload: { optionVotes: [{ votingOptionId, voteWeight }] }
      return apiClient.post(`/api/resolutions/${resolutionId}/vote`, voteData);
    } catch (error) {
      throw error;
    }
  }

  static saveDraft = async (resolutionId: string, voteData: any) => {
    try {
      return apiClient.post(`/api/resolutions/${resolutionId}/draft`, voteData);
    } catch (error) {
      throw error;
    }
  }

  static updateResolution = async (resolutionId: string, data: VotingItemRequest) => {
    try {
      return apiClient.put(`/api/resolutions/${resolutionId}`, data);
    } catch (error) {
      throw error;
    }
  }

  static updateStatus = async (resolutionId: string, status: boolean) => {
    try {
      return apiClient.post(`/api/resolutions/${resolutionId}/toggle`, {
        isActive: status
      });
    } catch (error) {
      throw error;
    }
  }
}
