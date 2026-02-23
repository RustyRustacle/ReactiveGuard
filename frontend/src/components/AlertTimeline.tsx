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
                    <div className="w-8 h-8 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-8 h-8 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
                    </div>
                );
            case 'safe':
                return (
                    <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
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
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/15 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    </div>
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
