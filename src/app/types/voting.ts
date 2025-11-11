export interface VotingSession {
  id: string;
  votingCode: string;
  title: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  totalVoters: number;
  totalVotes: number;
  startDate: string;
  endDate: string;
  options: VotingOption[];
  results: VotingResult[];
  createdAt: string;
}

export interface VotingOption {
  id: string;
  name: string;
}

export interface VotingResult {
  optionId: string;
  optionName: string;
  votes: number;
  percentage: number;
}

export interface ApiVotingData {
  votingId: string;
  votingCode: string;
  title: string;
  description: string;
  status: string;
  totalVoters: number;
  totalVotes: number;
  startDate: string;
  endDate: string;
  options: VotingOption[];
  results: VotingResult[];
  createdAt: string;
}

export interface ApiResponse {
  status: 'success' | 'error';
  data: any;
  message?: string;
}