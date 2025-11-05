export interface Meeting {
  meetingCode: string;
  title: string;
  description: string;
  meetingDate: string;
  dayStart: string;
  location: string;
  dayEnd:string;
  status: 'UPCOMING' | 'PENDING' | 'COMPLETED';
  participants: number;
  agenda: string[];
  candidates:string[];
}
export interface MeetingRequest {
  meetingCode: string;
  title: string;
  description: string;
  meetingDate: string;
  dayStart: string;
  location: string;
  dayEnd:string;
  status: 'UPCOMING' | 'PENDING' | 'COMPLETED';
}