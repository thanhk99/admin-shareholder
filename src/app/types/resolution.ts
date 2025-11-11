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

export interface ResolutionFormData {
  resolutionCode: string;
  resolutionTitle: string;
  resolutionDescription: string;
  resolutionType: 'ordinary' | 'special';
  votingMethod: 'show_of_hands' | 'ballot' | 'electronic';
  requiredApproval: number;
}