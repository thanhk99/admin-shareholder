export interface ProxyItem {
    id: number;
    delegatorId?: string; // used in GET list
    delegatorName?: string;
    principalId?: string; // used in POST response
    principalName?: string;
    proxyId: string;
    proxyName: string;
    sharesDelegated: number;
    status: string;
    createdAt: string;
}

export interface ProxyRequest {
    delegatorId: string;
    proxyId: string;
    sharesDelegated: number;
    authorizationDocument?: string;
}

export interface NonShareholderProxyRequest {
    fullName: string;
    cccd: string;
    dateOfIssue: string;
    address: string;
    meetingId: string;
    delegatorCccd: string;
    sharesDelegated: number;
    nation?: string;
    email?: string;
    phoneNumber?: string;
}

export interface NonShareholderProxyResponse {
    id: string;
    fullName: string;
    cccd: string;
    generatedPassword: string;
    meetingId: string;
    sharesDelegated: number;
}
