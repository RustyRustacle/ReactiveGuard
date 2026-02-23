'use client';

import type { AlertData } from '@/hooks/useReactiveAlerts';

interface AlertTimelineProps {
    alerts: AlertData[];
    className?: string;
}

export default function AlertTimeline({ alerts, className = '' }: AlertTimelineProps) {
    const formatTime = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🔴</span>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🟡</span>
                    </div>
                );
            case 'safe':
                return (
                    <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🟢</span>
                    </div>
                );
            default:
                return null;
        }
    };

    const getLabel = (type: string) => {
        switch (type) {
            case 'critical': return 'Liquidation Imminent';
            case 'warning': return 'Health Factor Warning';
            case 'safe': return 'Position Safe';
            default: return 'Unknown';
        }
    };

    const getTextColor = (type: string) => {
        switch (type) {
            case 'critical': return 'text-red-400';
            case 'warning': return 'text-yellow-400';
            case 'safe': return 'text-green-400';
            default: return 'text-slate-400';
        }
    };

    if (alerts.length === 0) {
        return (
            <div className={`${className}`}>
                <div className="text-center py-12">
                    <div className="text-4xl mb-3">📡</div>
                    <p className="text-slate-400 text-sm">No alerts yet</p>
                    <p className="text-slate-500 text-xs mt-1">Reactive events will appear here in real-time</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-1 ${className}`}>
            {alerts.map((alert, i) => (
                <div
                    key={`${alert.timestamp}-${i}`}
                    className={`
            flex items-start gap-3 p-3 rounded-xl transition-all duration-300
            hover:bg-white/5 group
            ${i === 0 ? 'bg-white/5 border border-white/10' : ''}
          `}
                    style={{
                        animation: i === 0 ? 'slideIn 0.3s ease-out' : undefined,
                    }}
                >
                    {getIcon(alert.type)}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold uppercase tracking-wider ${getTextColor(alert.type)}`}>
                                {getLabel(alert.type)}
                            </span>
                            {i === 0 && (
                                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded uppercase">
                                    New
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span>
                                HF: <span className={`font-mono font-bold ${getTextColor(alert.type)}`}>
                                    {parseFloat(alert.healthFactor).toFixed(4)}
                                </span>
                            </span>
                            {alert.collateralValue !== '0' && (
                                <span>
                                    CV: <span className="font-mono text-slate-300">${parseFloat(alert.collateralValue).toFixed(2)}</span>
                                </span>
                            )}
                            {alert.requiredTopUp && (
                                <span>
                                    Top-up: <span className="font-mono text-orange-400">{parseFloat(alert.requiredTopUp).toFixed(4)} ETH</span>
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 font-mono flex-shrink-0">
                        {formatTime(alert.timestamp)}
                    </div>
                </div>
            ))}
        </div>
    );
}
