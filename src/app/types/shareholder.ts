export interface addShareholderRequest {
  password?: string;
  fullName: string;
  email: string;
  sharesOwned: number;
  cccd: string;
  phoneNumber: string;
  address: string;
  dateOfIssue?: string;
  nation?: string;
  investorCode: string;
  meetingId: string;
}

export interface ShareholderForm {
  password?: string;
  fullName: string;
  email: string;
  sharesOwned: number;
  cccd: string;
  phoneNumber: string;
  address: string;
  dateOfIssue?: string;
  nation?: string;
  investorCode: string;
  meetingId: string;
}

export interface FormErrors {
  password?: string;
  fullName?: string;
  email?: string;
  sharesOwned?: string;
  cccd?: string;
  phoneNumber?: string;
  address?: string;
}

export interface updateShareholderRequest {
  cccd?: string;
  investorCode?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfIssue?: string;
  address?: string;
  nation?: string;
  sharesOwned?: number;
  enabled?: boolean;
}

export interface Shareholder {
  id: string;
  email: string;
  fullName: string;
  sharesOwned: number;
  receivedProxyShares: number;
  delegatedShares: number;
  phoneNumber: string;
  investorCode: string;
  cccd: string;
  dateOfIssue: string;
  address: string;
  meetingId?: string;
  nation?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}