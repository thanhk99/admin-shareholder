import apiClient from "../api-client";
import { ElectionRequest, ElectionCandidateRequest } from "@/app/types/election";

export class ElectionService {
    static createElection = async (meetingId: string, data: ElectionRequest) => {
        try {
            return apiClient.post(`/api/meetings/${meetingId}/elections`, data);
        } catch (error) {
            throw error;
        }
    }

    static getElectionById = async (electionId: string) => {
        try {
            return apiClient.get(`/api/elections/${electionId}`);
        } catch (error) {
            throw error;
        }
    }

    static addCandidateToElection = async (electionId: string, data: ElectionCandidateRequest) => {
        try {
            return apiClient.post(`/api/elections/${electionId}/options`, data);
        } catch (error) {
            throw error;
        }
    }

    static updateCandidate = async (candidateId: string, data: ElectionCandidateRequest) => {
        try {
            return apiClient.put(`/api/options/${candidateId}`, data);
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

    static updateElection = async (electionId: string, data: ElectionRequest) => {
        try {
            const payload = {
                title: data.title,
                description: data.description,
                electionType: data.electionType,
                displayOrder: data.displayOrder
            };
            return apiClient.post(`/api/elections/${electionId}/edit`, payload);
        } catch (error) {
            throw error;
        }
    }

    static deleteElection = async (electionId: string) => {
        try {
            return apiClient.delete(`/api/elections/${electionId}`);
        } catch (error) {
            throw error;
        }
    }

    static getResults = async (electionId: string) => {
        try {
            return apiClient.get(`/api/elections/${electionId}/results`);
        } catch (error) {
            throw error;
        }
    }
}
