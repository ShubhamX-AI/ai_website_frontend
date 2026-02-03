import { useState, useCallback } from 'react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
// The user pointed to livekit_modular which uses /api/getToken
const TOKEN_ENDPOINT = `${BACKEND_URL}/api/getToken`;


export function useLiveKitConnection() {
    const [token, setToken] = useState<string>('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const connect = useCallback(async (agentName: string = 'indusnet') => {
        setIsConnecting(true);
        setError(null);
        try {
            // Generate a random user ID for this session
            const userId = `user_${Math.floor(Math.random() * 10000)}`;
            const url = `${TOKEN_ENDPOINT}?name=${userId}&agent=${agentName}`;

            const response = await fetch(url, { mode: 'cors' });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }

            const accessToken = await response.text();
            if (!accessToken || accessToken.trim().length === 0) {
                throw new Error("Received empty token from backend");
            }

            setToken(accessToken);
        } catch (err: any) {
            console.error("Connection failed:", err);
            setError(err);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setToken('');
        setError(null);
    }, []);

    return {
        token,
        isConnecting,
        error,
        connect,
        disconnect
    };
}
