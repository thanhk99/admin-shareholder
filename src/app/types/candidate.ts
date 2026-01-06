export interface Candidate {
  id: string;
  meetingCode: string
  candidateName: string;
  candidateInfo: string;
  currentPosition: string;
  amountVotes: number;
  isActive: boolean;
  createAt: string;
  updateAt?: string;
  candidateType: 'BOD' | 'BOS';
}

export interface CandidateVote {
  candidateName: any;
  id: string;
  candidateId: string;
  shareholderId: string;
  meetingCode: string;
  amountShare: number;
  votedAt: string;
  updateAt?: string;
}

export interface ElectionSession {
  id: string;
  meetingCode: string;
  title: string;
  description: string;
  candidates: Candidate[];
  status: 'pending' | 'upcoming' | 'completed';
  totalVotes: number;
  totalShares: number;
  startDate: string;
  endDate: string;
  results?: ElectionResult[];
}



export interface ElectionResult {
  candidateId: string;
  candidateName: string;
  votes: number;
  shares: number;
  percentage: number;
  position: number;
}

export interface CandidateFormData {
  id: string;
  candidateName: string;
  candidateInfo: string;
  currentPosition: string;
  meetingCode: string;
  candidateType: 'BOD' | 'BOS';
}


export interface Meeting {
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
}

export interface ApiElectionData {
  meeting: Meeting;
  candidateCount: number;
  totalVotes: number;
  candidateVotes: CandidateVote[];
}

export interface ApiResponse {
  data: ApiElectionData[];
  status: string;
}

export interface Candidate {
  id: string;
  meetingCode: string;
  candidateName: string;
  candidateInfo: string;
  currentPosition: string;
  amountVotes: number;
  isActive: boolean;
  createAt: string;
  candidateType: 'BOD' | 'BOS';
}

export interface ElectionResult {
  candidateId: string;
  candidateName: string;
  votes: number;
  shares: number;
  percentage: number;
  position: number;
}