export type MeetingStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Meeting {
  id: string;
  title: string;
  description: string;
  meetingDate?: string;
  meetingCode?: string;
  startTime: string;
  endTime: string;
  location: string;
  status: MeetingStatus;
  participants?: number;
  agenda?: string[];
  candidates?: string[];
  resolutions?: any[]; // Will be typed properly with Resolution interface
  elections?: any[]; // Will be typed properly with Election interface
}

export interface MeetingRequest {
  title: string;
  description: string;
  meetingDate: string; // ISO date (YYYY-MM-DD)
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  location: string;
  status: MeetingStatus;
}