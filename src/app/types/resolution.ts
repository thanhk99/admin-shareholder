// types/resolution.ts

export interface Resolution {
  id: string;
  meetingCode: string;
  resolutionCode: string;
  title: string;
  description: string;
  totalAgree: number;
  totalNotAgree: number;
  totalNotIdea: number;
  createdAt: string;
  createBy: string;
  isActive: boolean;
}

// Interfaces cho VotingManagement
export interface Meeting {
  meetingCode: string;
  title: string;
  description: string;
  meetingDate: string;
  location?: string;
  status: 'COMPLETED' | 'PENDING' | 'UPCOMING';
  dayStart: string;
  dayEnd: string;
  createdAt: string;
  updatedAt: string;
  createBy: string | null;
  updateBy: string | null;
}

export interface ResolutionVote {
  title: string;
  description: string;
  resolutionCode: string;
  agreeVotes: number;
  notAgreeVotes: number;
  noIdeaVotes: number;
  isActive: boolean;
}

export interface MeetingResponse {
  meeting: Meeting;
  resolutionCount: number;
  resolutionVotes: ResolutionVote[];
}

export interface MeetingGroup {
  meetingCode: string;
  meetingTitle: string;
  meetingDate: string;
  location?: string;
  status: 'COMPLETED' | 'PENDING' | 'UPCOMING';
  resolutions: ResolutionVote[];
  totalResolutions: number;
  totalVotes: number;
  approvedResolutions: number;
}

interface ApiResponse {
  status: string;
  data: {
    meeting: {
      meetingCode: string;
      title: string;
      description: string;
      meetingDate: string;
      location: string;
      status: string;
      dayStart: string;
      dayEnd: string;
      createdAt: string;
      updatedAt: string;
      createBy: string | null;
      updateBy: string | null;
    };
    resolutionCount: number;
    resolutionVotes: Array<{
      title: string;
      description: string;
      resolutionCode: string;
      agreeVotes: number;
      notAgreeVotes: number;
      noIdeaVotes: number;
    }>;
  };
}

export interface ResolutionFormData {
  resolutionCode?: string;
  meetingCode: string;
  title: string;
  description: string;
}