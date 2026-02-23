'use client';

import { useEffect, useState } from 'react';
import type { AlertData } from '@/hooks/useReactiveAlerts';

interface AlertBannerProps {
    alert: AlertData | null;
    onDismiss?: () => void;
    onRescue?: () => void;
}

export default function AlertBanner({ alert, onDismiss, onRescue }: AlertBannerProps) {
    const [visible, setVisible] = useState(false);
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        if (alert && alert.type !== 'safe') {
            setVisible(true);
            setExiting(false);
        } else if (alert?.type === 'safe') {
            handleDismiss();
        }
    }, [alert]);

    const handleDismiss = () => {
        setExiting(true);
        setTimeout(() => {
            setVisible(false);
            setExiting(false);
            onDismiss?.();
        }, 300);
    };

    if (!visible || !alert) return null;

    const isWarning = alert.type === 'warning';
    const isCritical = alert.type === 'critical';

    const bgColor = isCritical
        ? 'from-red-900/90 to-red-800/90'
        : 'from-yellow-900/90 to-yellow-800/90';

    const borderColor = isCritical ? 'border-red-500/50' : 'border-yellow-500/50';
    const iconBg = isCritical ? 'bg-red-500/20' : 'bg-yellow-500/20';
    const textColor = isCritical ? 'text-red-200' : 'text-yellow-200';
    const accentColor = isCritical ? 'text-red-400' : 'text-yellow-400';

    return (
        <div
            className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4
        transition-all duration-300 ease-out
        ${exiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}
      `}
        >
            <div
                className={`
          bg-gradient-to-r ${bgColor} backdrop-blur-xl
          border ${borderColor} rounded-2xl shadow-2xl
          p-4 flex items-center gap-4
          ${isCritical ? 'animate-pulse-subtle' : ''}
        `}
            >
                {/* Icon */}
                <div className={`${iconBg} rounded-xl p-3 flex-shrink-0`}>
                    {isCritical ? (
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm ${accentColor} uppercase tracking-wider`}>
                        {isCritical ? '🔴 Liquidation Imminent' : '🟡 Health Factor Warning'}
                    </div>
                    <div className={`text-sm ${textColor} mt-0.5`}>
                        Health Factor: <span className="font-mono font-bold">{parseFloat(alert.healthFactor).toFixed(4)}</span>
                        {alert.requiredTopUp && (
                            <span className="ml-2">
                                • Top-up needed: <span className="font-mono font-bold">{parseFloat(alert.requiredTopUp).toFixed(4)} ETH</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {isCritical && onRescue && (
                        <button
                            onClick={onRescue}
                            className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-sm font-bold rounded-xl
                         transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-red-500/25"
                        >
                            🚨 Rescue Now
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
