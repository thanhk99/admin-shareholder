import { useEffect, useRef, useState } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { API_CONFIG } from '@/lib/api-config';
import { tokenManager } from '@/utils/tokenManager';

interface UseWebSocketProps {
    meetingId: string;
    onMessage?: (message: any) => void;
    enabled?: boolean;
}

export const useWebSocket = ({ meetingId, onMessage, enabled = true }: UseWebSocketProps) => {
    const [stats, setStats] = useState<{ connected: boolean; error: string | null }>({
        connected: false,
        error: null,
    });
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!enabled || !meetingId) {
            return;
        }

        const token = tokenManager.getAccessToken();
        // Construct the WebSocket URL.
        // Assuming API_CONFIG.BASE_URL is like "http://dhcd.vix.local:8085"
        // We need to replace 'http' with 'ws' and append '/ws'
        const baseUrl = API_CONFIG.BASE_URL;
        // Common pattern for Spring Boot with SockJS: raw WebSocket is at /ws/websocket
        const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/websocket';

        const client = new Client({
            brokerURL: wsUrl,
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: function (str) {
                console.log('STOMP: ' + str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                setStats({ connected: true, error: null });

                client.subscribe(`/topic/meeting/${meetingId}`, (message: IMessage) => {
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
                console.error('Additional details: ' + frame.body);
                setStats({ connected: false, error: frame.headers['message'] || 'Stomp Error' });
            },
            onWebSocketError: (event) => {
                console.error('WebSocket error:', event);
                setStats({ connected: false, error: 'WebSocket Error' });
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
            }
        };
    }, [meetingId, enabled]);

    return stats;
};
