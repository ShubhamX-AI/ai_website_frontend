import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
// The user pointed to livekit_modular which uses /api/getToken
const TOKEN_ENDPOINT = `${BACKEND_URL}/api/getToken`;


export function useLiveKitConnection() {
    const [token, setToken] = useState<string>('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Standardize key with other hooks
    const USER_INFO_KEY = 'user_info';

    // Read and parse user info safely
    let user = null;
    const storedUserInfo = typeof window !== 'undefined' ? localStorage.getItem(USER_INFO_KEY) : null;

    if (storedUserInfo) {
        try {
            user = JSON.parse(storedUserInfo);
        } catch (e) {
            console.error("Failed to parse user info", e);
        }
    }

    // If userInfo not present or invalid, create one and sync back to local variable
    if (!user) {
        user = {
            user_name: '',
            user_email: '',
            user_phone: '',
            user_id: uuidv4()
        };
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
        }
    }

    const name = user?.user_name || '';
    const email = user?.user_email || '';
    const phone = user?.user_phone || '';
    const userId = user?.user_id || '';



    const connect = useCallback(async (agentName: string = 'indusnet') => {
        setIsConnecting(true);
        setError(null);
        try {
            // Send the user info to the backend
            const url = `${TOKEN_ENDPOINT}?name=${name}&user_id=${userId}&agent=${agentName}&email=${email}&phone=${phone}`;

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
    }, [name, userId, email, phone]);

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
