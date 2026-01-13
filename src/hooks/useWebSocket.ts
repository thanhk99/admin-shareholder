import { useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_CONFIG } from '@/lib/api-config';
import { tokenManager } from '@/utils/tokenManager';
import { MeetingService } from '@/lib/api/meetings';

interface UseWebSocketProps {
    meetingId?: string;
    onMessage?: (message: any) => void;
    enabled?: boolean;
}

export const useWebSocket = ({ meetingId: initialMeetingId, onMessage, enabled = true }: UseWebSocketProps) => {
    const [stats, setStats] = useState<{ connected: boolean; error: string | null; activeMeetingId: string | null }>({
        connected: false,
        error: null,
        activeMeetingId: initialMeetingId || null,
    });
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        let isMounted = true;

        const connect = async () => {
            let currentMeetingId = initialMeetingId;

            if (!currentMeetingId && enabled) {
                try {
                    const response = await MeetingService.getOngoingMeeting();
                    // Assuming response structure is like { id: '...', ... } or { data: { id: '...' } }
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

            const token = tokenManager.getAccessToken();
            const baseUrl = API_CONFIG.BASE_URL;
            const wsUrl = baseUrl + '/api/ws';

            const client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                debug: function (str) {
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log('Connected to WebSocket (SockJS) for meeting:', currentMeetingId);
                    if (isMounted) {
                        setStats({ connected: true, error: null, activeMeetingId: currentMeetingId || null });
                    }

                    client.subscribe(`/topic/meeting/${currentMeetingId}`, (message: IMessage) => {
                        try {
                            const body = JSON.parse(message.body);
                            if (onMessage) {
                                onMessage(body);
                            }
                        } catch (e) {
                            console.error('Error parsing message:', e);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    if (isMounted) {
                        setStats(prev => ({ ...prev, connected: false, error: frame.headers['message'] || 'Stomp Error' }));
                    }
                },
                onWebSocketError: (event) => {
                    console.error('WebSocket error:', event);
                    if (isMounted) {
                        setStats(prev => ({ ...prev, connected: false, error: 'WebSocket Error' }));
                    }
                }
            });

            client.activate();
            clientRef.current = client;
        };

        connect();

        return () => {
            isMounted = false;
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [initialMeetingId, enabled]);

    return stats;
};

