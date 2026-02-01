import { MeetingRealtimeStatus, RealtimeMessageType, RealtimePayload, RawRealtimeMessage } from '@/app/types/realtime';

export function normalizeMessage(msg: any): RealtimePayload {
    if (!msg) {
        return {
            type: RealtimeMessageType.ERROR,
            data: {} as MeetingRealtimeStatus,
        };
    }

    if (msg.type && msg.data) {
        return msg as RealtimePayload;
    }

    if (msg.data && !msg.type) {
        return {
            type: RealtimeMessageType.FULL,
            data: msg.data,
            timestamp: Date.now()
        };
    }

    return {
        type: RealtimeMessageType.FULL,
        data: msg,
        timestamp: Date.now()
    };
}


export function mergeRealtimeStatus(
    current: MeetingRealtimeStatus | null,
    update: MeetingRealtimeStatus
): MeetingRealtimeStatus {
    if (!current) return update;

    return {
        ...current,
        ...update,
        resolutionResults: update.resolutionResults || current.resolutionResults,
        electionResults: update.electionResults || current.electionResults
    };
}

export function safePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    const percent = (value / total) * 100;
    return Math.min(100, Math.max(0, Number(percent.toFixed(2))));
}
