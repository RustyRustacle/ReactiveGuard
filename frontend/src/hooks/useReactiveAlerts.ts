'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface AlertData {
    type: 'warning' | 'critical' | 'safe';
    user: string;
    healthFactor: string;
    collateralValue: string;
    borrowedAmount: string;
    requiredTopUp?: string;
    timestamp: number;
}

const SUBSCRIBER_URL = process.env.NEXT_PUBLIC_SUBSCRIBER_URL || 'http://localhost:3001';

// ──────────────────────── Demo Mode Simulation ────────────────────────
const DEMO_SCENARIOS = [
    { type: 'warning' as const, healthFactor: '1.18', collateralValue: '1770.00', borrowedAmount: '1200.00' },
    { type: 'critical' as const, healthFactor: '1.04', collateralValue: '1560.00', borrowedAmount: '1200.00', requiredTopUp: '0.25' },
    { type: 'critical' as const, healthFactor: '0.98', collateralValue: '1470.00', borrowedAmount: '1200.00', requiredTopUp: '0.40' },
    { type: 'warning' as const, healthFactor: '1.22', collateralValue: '1830.00', borrowedAmount: '1200.00' },
    { type: 'safe' as const, healthFactor: '1.55', collateralValue: '2325.00', borrowedAmount: '1200.00' },
];

export function useReactiveAlerts(userAddress?: string) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [latestAlert, setLatestAlert] = useState<AlertData | null>(null);
    const [demoMode, setDemoMode] = useState(true);
    const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const demoIndexRef = useRef(0);

    // Process incoming alert
    const handleAlert = useCallback((alert: AlertData) => {
        setLatestAlert(alert);
        setAlerts((prev) => [alert, ...prev].slice(0, 50));
    }, []);

    // Socket.io connection
    useEffect(() => {
        if (demoMode) return;

        const newSocket = io(SUBSCRIBER_URL, {
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            setConnected(true);
            console.log('🔌 Connected to ReactiveGuard subscriber');

            if (userAddress) {
                newSocket.emit('subscribe-user', userAddress);
            }
        });

        newSocket.on('disconnect', () => {
            setConnected(false);
        });

        newSocket.on('reactive-alert', handleAlert);
        newSocket.on('user-alert', handleAlert);

        newSocket.on('alert-history', (history: AlertData[]) => {
            setAlerts(history.reverse());
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [demoMode, userAddress, handleAlert]);

    // Demo mode simulation
    const startDemoSimulation = useCallback(() => {
        if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);

        demoIndexRef.current = 0;
        setAlerts([]);
        setLatestAlert(null);

        demoIntervalRef.current = setInterval(() => {
            const scenario = DEMO_SCENARIOS[demoIndexRef.current % DEMO_SCENARIOS.length];
            const alert: AlertData = {
                ...scenario,
                user: userAddress || '0xDemoUser1234567890abcdef1234567890ab',
                timestamp: Date.now(),
            };

            handleAlert(alert);
            demoIndexRef.current++;

            if (demoIndexRef.current >= DEMO_SCENARIOS.length) {
                if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
            }
        }, 2500);
    }, [userAddress, handleAlert]);

    // Cleanup demo interval
    useEffect(() => {
        return () => {
            if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
        };
    }, []);

    const clearAlerts = useCallback(() => {
        setAlerts([]);
        setLatestAlert(null);
    }, []);

    return {
        connected: demoMode ? true : connected,
        alerts,
        latestAlert,
        demoMode,
        setDemoMode,
        startDemoSimulation,
        clearAlerts,
    };
}
