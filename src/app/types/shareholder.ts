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
  shares?: string; 
  cccd?: string;
  status?: string;
  phone?: string ;
}