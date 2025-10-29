export interface addShareholderRequest{
    fullname: string,
    email: string,
    shares: number,
    cccd: string
    status: string
}

export interface ShareholderForm {
  fullname: string;
  email: string;
  shares: number;
  cccd: string;
  phone:string;
  status: 'active' | 'inactive';
}

export interface FormErrors {
  fullname?: string;
  email?: string;
  shares?: string; 
  cccd?: string;
  status?: string;
  phone?: string ;
}