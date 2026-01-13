'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MeetingRealtimeStatus } from '@/app/types/realtime';

interface RealtimeContextType {
    isConnected: boolean;
    error: string | null;
    activeMeetingId: string | null;
    realtimeStatus: MeetingRealtimeStatus | null;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

import { MeetingService } from '@/lib/api/meetings';

export function RealtimeProvider({ children }: { children: ReactNode }) {
    const [realtimeStatus, setRealtimeStatus] = useState<MeetingRealtimeStatus | null>(null);

    const { connected, error, activeMeetingId } = useWebSocket({
        onMessage: (msg: any) => {
            console.log('Realtime Update Received:', msg);
            const status = msg.data || msg;
            setRealtimeStatus(status);
        }
    });

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
    }, [activeMeetingId]);

    return (
        <RealtimeContext.Provider
            value={{
                isConnected: connected,
                error,
                activeMeetingId,
                realtimeStatus
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
