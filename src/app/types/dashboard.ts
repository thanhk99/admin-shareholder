export interface UserStats {
    totalShareholders: number;
    totalSharesRepresented: number;
}

export interface MeetingStats {
    totalMeetings: number;
    scheduled: number;
    ongoing: number;
    completed: number;
    cancelled: number;
}

export interface DashboardStatsResponse {
    userStats: UserStats;
    meetingStats: MeetingStats;
}
