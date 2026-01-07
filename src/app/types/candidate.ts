export interface Candidate {
  id: string;
  votingItemId: string;
  name: string;
  position: string;
  bio: string;
  photoUrl?: string;
  displayOrder: number;
}

export interface CandidateRequest {
  name: string;
  position: string;
  bio: string;
  photoUrl?: string;
  displayOrder: number;
}