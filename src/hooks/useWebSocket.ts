import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_CONFIG } from '@/lib/api-config';
import { tokenManager } from '@/utils/tokenManager';
import { MeetingService } from '@/lib/api/meetings';
import { normalizeMessage } from '@/lib/realtime';
import { RealtimePayload } from '@/app/types/realtime';

interface UseWebSocketProps {
    meetingId?: string;
    onMessage?: (message: RealtimePayload) => void;
    enabled?: boolean;
    getAccessToken?: () => Promise<string | null>;
    forceReconnect?: number;
}

export const useWebSocket = ({
    meetingId: initialMeetingId,
    onMessage,
    enabled = true,
    getAccessToken,
    forceReconnect = 0
}: UseWebSocketProps) => {
    const [stats, setStats] = useState<{ connected: boolean; error: string | null; activeMeetingId: string | null }>({
        connected: false,
        error: null,
        activeMeetingId: initialMeetingId || null,
    });
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null); // Keep track of subscription to unsubscribe specifically

    // Helper to get token (from prop or default manager)
    const fetchToken = useCallback(async () => {
        if (getAccessToken) {
            return await getAccessToken();
        }
        return tokenManager.getAccessToken();
    }, [getAccessToken]);

    useEffect(() => {
        let isMounted = true;
        let currentClient = clientRef.current;

        const cleanup = () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
            if (currentClient && currentClient.active) {
                currentClient.deactivate();
            }
            if (isMounted) {
                setStats(prev => ({ ...prev, connected: false }));
            }
        };

        const connect = async () => {
            // 1. Resolve meeting ID
            let currentMeetingId = initialMeetingId;

            if (!currentMeetingId && enabled) {
                try {
                    const response = await MeetingService.getOngoingMeeting();
                    const meetingData = (response as any).data || response;
                    if (meetingData && meetingData.id) {
                        currentMeetingId = meetingData.id;
                    }
                } catch (error) {
                    console.error('Error fetching ongoing meeting for WebSocket:', error);
                    if (isMounted) {
                        setStats(prev => ({ ...prev, error: 'Could not fetch ongoing meeting' }));
                    }
                    return;
                }
            }

            if (!enabled || !currentMeetingId) {
                if (isMounted) {
                    setStats(prev => ({ ...prev, activeMeetingId: currentMeetingId || null }));
                }
                return;
            }

            if (isMounted) {
                setStats(prev => ({ ...prev, activeMeetingId: currentMeetingId || null }));
            }

            const baseUrl = API_CONFIG.BASE_URL;
            const wsUrl = baseUrl + '/api/ws';

            // 2. Initialize Client
            const client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                debug: function (str) {
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,

                beforeConnect: async () => {
                    try {
                        const token = await fetchToken();
                        if (token) {
                            client.connectHeaders = {
                                Authorization: `Bearer ${token}`,
                            };
                        } else {
                            console.warn('No access token available for WebSocket');
                        }
                    } catch (err) {
                        console.error('Failed to get access token for WebSocket:', err);
                    }
                },

                onConnect: () => {
                    console.log('Connected to WebSocket (SockJS) for meeting:', currentMeetingId);
                    if (isMounted) {
                        setStats(prev => ({ ...prev, connected: true, error: null }));
                    }

                    // Subscribe logic
                    if (subscriptionRef.current) {
                        subscriptionRef.current.unsubscribe();
                    }

                    if (currentMeetingId) {
                        subscriptionRef.current = client.subscribe(`/topic/meeting/${currentMeetingId}`, (message: IMessage) => {
                            try {
                                const body = JSON.parse(message.body);
                                const normalized = normalizeMessage(body);
                                if (onMessage) {
                                    onMessage(normalized);
                                }
                            } catch (e) {
                                console.error('Error parsing message:', e);
                            }
                        });
                    }
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    if (isMounted) {
                        setStats(prev => ({ ...prev, connected: false, error: frame.headers['message'] || 'Stomp Error' }));
                    }
                },
                onWebSocketClose: () => {
                    if (isMounted) {
                        setStats(prev => ({ ...prev, connected: false }));
                    }
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                    if (isMounted) {
                        setStats(prev => ({ ...prev, connected: false, error: 'WebSocket Connection Error' }));
                    }
                }
            });

            client.activate();
            clientRef.current = client;
            currentClient = client;
        };

        connect();

        return () => {
            isMounted = false;
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [initialMeetingId, enabled, fetchToken, forceReconnect]);

    return stats;
};
