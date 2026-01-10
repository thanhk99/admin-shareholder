export type VotingType = 'RESOLUTION' | 'BOARD_OF_DIRECTORS' | 'SUPERVISORY_BOARD' | 'YES_NO';

// Voting option types for resolutions
export type VotingOptionType = 'AGREE' | 'DISAGREE' | 'NO_IDEA';

export interface VotingItem {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  votingType: VotingType;
  maxSelections: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  displayOrder: number;
  votingOptions?: VotingOption[];
  userVotes?: UserVote[] | null;
}

export interface VotingOption {
  id: string;
  name: string;
  type?: VotingOptionType; // For resolutions
  position?: string | null; // For elections
  bio?: string | null; // For elections
  photoUrl?: string | null; // For elections
  displayOrder: number;
}

export interface UserVote {
  votingOptionId: string;
  votingOptionName: string;
  voteWeight: number;
  votedAt: string;
}

export interface VotingItemRequest {
  title: string;
  description: string;
  displayOrder?: number;
  // Giữ lại các trường cũ cho Election nếu cần, hoặc tạo request riêng
  votingType?: VotingType;
  startTime?: string;
  endTime?: string;
  maxSelections?: number;
}

export interface VotingResult {
  meetingId?: string;
  meetingTitle?: string;
  resolutionId?: string;
  resolutionTitle?: string;
  electionId?: string;
  electionTitle?: string;
  totalVoters: number;
  totalWeight: number;
  results: {
    votingOptionId?: string;
    votingOptionName?: string;
    candidateId?: string; // Tương thích cũ
    candidateName?: string; // Tương thích cũ
    voteCount: number;
    totalWeight: number;
    percentage: number;
  }[];
}