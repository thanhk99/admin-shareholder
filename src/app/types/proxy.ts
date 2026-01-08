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
