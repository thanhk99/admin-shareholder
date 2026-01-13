export interface VoteOptionResult {
    votingOptionId: string;
    votingOptionName: string; // "Đồng ý", "Không đồng ý", "Không có ý kiến"
    voteCount: number;
    totalWeight: number;
    percentage: number;
}

export interface ResolutionResult {
    meetingId: string;
    meetingTitle: string;
    resolutionId: string;
    resolutionTitle: string;
    results: VoteOptionResult[];
    totalVoters: number;
    totalWeight: number;
    createdAt: string;
}

export interface CandidateResult {
    candidateId: string;
    fullName: string;
    voteCount: number;
    votePercent: number;
}

export interface ElectionResult {
    meetingId: string;
    meetingTitle: string;
    electionId: string;
    electionTitle: string;
    results: VoteOptionResult[];
    totalVoters: number;
    totalWeight: number;
    createdAt: string;
}

export interface MeetingRealtimeStatus {
    meetingId: string;
    resolutionResults: ResolutionResult[];
    electionResults: ElectionResult[];
}
