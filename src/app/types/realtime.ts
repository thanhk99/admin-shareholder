export interface VoteOptionResult {
    votingOptionId: string;
    votingOptionName: string; // "Đồng ý", "Không đồng ý", "Không có ý kiến" hoặc tên ứng viên
    voteCount: number;
    totalWeight: number;
    percentage: number;
}

export interface ResolutionResult {
    resolutionId: string;
    results: VoteOptionResult[];
    totalVoters: number;
    totalWeight: number;
}

export interface ElectionResult {
    electionId: string;
    results: VoteOptionResult[];
    totalVoters: number;
    totalWeight: number;
}

/**
 * Payload chuẩn nhận về từ WebSocket Topic: /topic/meeting/{meetingId}
 * Phản ánh bản snapshot mới nhất từ Kafka Consumer
 */
export interface MeetingRealtimeStatus {
    meetingId: string;
    resolutionResults: ResolutionResult[];
    electionResults: ElectionResult[];
}

export enum RealtimeMessageType {
    FULL = 'FULL',
    DELTA = 'DELTA',
    ERROR = 'ERROR'
}

export interface RealtimePayload<T = MeetingRealtimeStatus> {
    type: RealtimeMessageType;
    data: T;
    timestamp?: number;
    meetingId?: string;
}

// Union type for flexibility in normalization
export type RawRealtimeMessage =
    | RealtimePayload
    | MeetingRealtimeStatus
    | { data: MeetingRealtimeStatus };
