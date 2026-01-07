import { API_CONFIG } from "../api-config";
import apiClient from "../api-client";
import { CandidateRequest } from "@/app/types/candidate";

export default class CandidateService {
    static api_voting_items = API_CONFIG.ENDPOINTS.VOTING.ITEMS;

    static getAllCandidates = async () => {
        try {
            // This is a likely endpoint based on existing code usage, 
            // though not explicitly in the new guide.
            return apiClient.get('/api/admin/reports/getElectionResults');
        } catch (error) {
            throw error;
        }
    }

    static getCandidatesByVotingItem = async (votingItemId: string) => {
        try {
            return apiClient.get(`${this.api_voting_items}/${votingItemId}/candidates`);
        } catch (error) {
            throw error;
        }
    }

    static createCandidate = async (resolutionId: string, candidate: CandidateRequest) => {
        try {
            return apiClient.post(`/api/resolutions/${resolutionId}/candidates`, candidate);
        } catch (error) {
            throw error;
        }
    }

    static updateCandidate = async (candidateId: string, candidate: CandidateRequest) => {
        try {
            return apiClient.put(`/api/options/${candidateId}`, candidate);
        } catch (error) {
            throw error;
        }
    }

    static deleteCandidate = async (candidateId: string) => {
        try {
            return apiClient.delete(`/api/options/${candidateId}`);
        } catch (error) {
            throw error;
        }
    }
}