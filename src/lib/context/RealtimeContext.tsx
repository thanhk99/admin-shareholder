'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MeetingRealtimeStatus, RealtimePayload } from '@/app/types/realtime';
import { MeetingService } from '@/lib/api/meetings';
import { mergeRealtimeStatus } from '@/lib/realtime';

interface RealtimeContextType {
    isConnected: boolean;
    error: string | null;
    activeMeetingId: string | null;
    realtimeStatus: MeetingRealtimeStatus | null;
    refreshConnection: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const [realtimeStatus, setRealtimeStatus] = useState<MeetingRealtimeStatus | null>(null);
    const [forceReconnectCounter, setForceReconnectCounter] = useState(0);

    const handleMessage = useCallback((msg: RealtimePayload) => {
        // console.log('Realtime Update Received:', msg);
        if (msg.type === 'ERROR') {
            console.error('Realtime error received:', msg);
            return;
        }

        setRealtimeStatus((prevStatus) => {
            if (!msg.data) return prevStatus;
            return mergeRealtimeStatus(prevStatus, msg.data as MeetingRealtimeStatus);
        });
    }, []);

    const { connected, error, activeMeetingId } = useWebSocket({
        onMessage: handleMessage,
        forceReconnect: forceReconnectCounter,
    });

    const refreshConnection = useCallback(() => {
        setForceReconnectCounter(c => c + 1);
    }, []);

    React.useEffect(() => {
        const fetchInitialStatus = async () => {
            if (activeMeetingId) {
                try {
                    const response = await MeetingService.getRealtimeStatus(activeMeetingId);
                    const status = (response as any).data || response;
                    setRealtimeStatus(status);
                } catch (err) {
                    console.error('Failed to fetch initial realtime status:', err);
                }
            }
        };

        fetchInitialStatus();
    }, [activeMeetingId, forceReconnectCounter]);

    return (
        <RealtimeContext.Provider
            value={{
                isConnected: connected,
                error,
                activeMeetingId,
                realtimeStatus,
                refreshConnection
            }}
        >
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtime() {
    const context = useContext(RealtimeContext);
    if (context === undefined) {
        throw new Error('useRealtime must be used within a RealtimeProvider');
    }
    return context;
}
