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
}

export interface CandidateVote {
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
  status: 'pending' | 'active' | 'completed';
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
  id:string;
  candidateName: string;
  candidateInfo: string;
  currentPosition: string;
  meetingCode: string;
}