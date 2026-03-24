export type ElectionType = 'BOARD_OF_DIRECTORS' | 'SUPERVISORY_BOARD';

export interface Election {
    id: string;
    title: string;
    description: string;
    electionType: ElectionType;
    displayOrder: number;
    numSeats: number;
    votingOptions: ElectionCandidate[];
}

export interface ElectionCandidate {
    id: string;
    name: string;
    position: string;
    bio: string;
    photoUrl?: string;
    displayOrder: number;
}

export interface ElectionRequest {
    title: string;
    description: string;
    electionType: ElectionType;
    displayOrder: number;
    numSeats: number;
}

export interface ElectionCandidateRequest {
    name: string;
    position: string;
    bio: string;
    photoUrl?: string;
    displayOrder: number;
}
