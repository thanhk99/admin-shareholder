export interface addShareholderRequest{
    fullname: string,
    email: string,
    shares: number,
    cccd: string
    address: string,
    phone:string
}

export interface ShareholderForm {
  fullname: string;
  email: string;
  shares: number;
  cccd: string;
  address: string,
  phone:string;
  status: string
}

export interface FormErrors {
  fullname?: string;
  email?: string;
  shares?: string; 
  cccd?: string;
  address?: string;
  phone?: string ;
}

export interface updateShareholderRequest{
  fullname?: string;
  email?: string;
  shares?: number; 
  cccd?: string;
  address?: string;
  status? : boolean;
  phone?: string ;
  birthDay?:string;
  nation?:string;
}
export interface Shareholder {
  shareholderCode: string;
  fullName?: string;
  email: string;
  phone: string;
  address: string;
  ownShares: number;
  authorizedShares: number;
  representedShares: number;
  status: boolean;
  createAt: string;
  createBy: string;
  updateAt: string;
  updatedBy: string;
  nation: string;
  birthDay: string;
  cccd: string;
  lockShare: number;
}