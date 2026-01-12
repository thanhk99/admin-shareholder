'use client';

import React, { useState } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function WebSocketTest() {
    const [meetingId, setMeetingId] = useState('1'); // Default to 1
    const [messages, setMessages] = useState<any[]>([]);

    const { connected, error } = useWebSocket({
        meetingId,
        onMessage: (msg) => {
            console.log('Received message:', msg);
            setMessages((prev) => [...prev, { timestamp: new Date(), data: msg }]);
        },
    });

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
            <h2>WebSocket Test</h2>
            <div style={{ marginBottom: '10px' }}>
                <label>
                    Meeting ID:
                    <input
                        type="text"
                        value={meetingId}
                        onChange={(e) => setMeetingId(e.target.value)}
                        style={{ marginLeft: '10px', padding: '5px' }}
                    />
                </label>
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Status: </strong>
                <span style={{ color: connected ? 'green' : 'red' }}>
                    {connected ? 'Connected' : 'Disconnected'}
                </span>
                {error && <span style={{ color: 'red', marginLeft: '10px' }}>({error})</span>}
            </div>

            <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px' }}>
                <h3>Messages:</h3>
                {messages.length === 0 && <p>No messages received yet.</p>}
                {messages.map((msg, idx) => (
                    <div key={idx} style={{ marginBottom: '5px', padding: '5px', background: '#f9f9f9' }}>
                        <span style={{ fontSize: '0.8em', color: '#666' }}>
                            {msg.timestamp.toLocaleTimeString()}
                        </span>
                        <pre style={{ margin: '5px 0' }}>{JSON.stringify(msg.data, null, 2)}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
}
