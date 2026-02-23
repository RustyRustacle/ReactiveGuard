'use client';

import { useState } from 'react';

interface RescueModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredTopUp: string;
    currentHF: string;
    collateralValue: string;
    borrowedAmount: string;
    onDeposit?: (amount: string) => void;
    onRepay?: (amount: string) => void;
}

export default function RescueModal({
    isOpen,
    onClose,
    requiredTopUp,
    currentHF,
    collateralValue,
    borrowedAmount,
    onDeposit,
    onRepay,
}: RescueModalProps) {
    const [activeTab, setActiveTab] = useState<'deposit' | 'repay'>('deposit');
    const [amount, setAmount] = useState(requiredTopUp);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleAction = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'deposit') {
                onDeposit?.(amount);
            } else {
                onRepay?.(amount);
            }
        } finally {
            setTimeout(() => setIsLoading(false), 2000);
        }
    };

    // Calculate new health factor after rescue
    const calcNewHF = () => {
        const cv = parseFloat(collateralValue);
        const ba = parseFloat(borrowedAmount);
        const topUp = parseFloat(amount) || 0;

        if (activeTab === 'deposit') {
            // Adding collateral: newHF = ((cv + topUp * ethPrice) * 0.8) / ba
            const ethPrice = cv / 1; // simplified
            const newCV = cv + topUp * ethPrice;
            return ((newCV * 0.8) / ba).toFixed(2);
        } else {
            // Repaying: newHF = (cv * 0.8) / (ba - repayAmount)
            const newBA = Math.max(ba - topUp, 0);
            if (newBA === 0) return '∞';
            return ((cv * 0.8) / newBA).toFixed(2);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700/50 shadow-2xl w-full max-w-md overflow-hidden">
                {/* Danger gradient top */}
                <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

                {/* Header */}
                <div className="px-6 pt-5 pb-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            🚨 Position Rescue
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Protect your position from liquidation</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Current stats */}
                <div className="px-6 py-3">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 grid grid-cols-2 gap-3">
                        <div>
                            <div className="text-xs text-slate-400">Current Health Factor</div>
                            <div className="text-lg font-mono font-bold text-red-400">{parseFloat(currentHF).toFixed(4)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">Required Top-Up</div>
                            <div className="text-lg font-mono font-bold text-orange-400">{parseFloat(requiredTopUp).toFixed(4)} ETH</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">Collateral Value</div>
                            <div className="text-sm font-mono text-slate-300">${parseFloat(collateralValue).toFixed(2)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-400">Borrowed Amount</div>
                            <div className="text-sm font-mono text-slate-300">${parseFloat(borrowedAmount).toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* Tab selector */}
                <div className="px-6 flex gap-2">
                    <button
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'deposit'
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:bg-white/5'
                            }`}
                        onClick={() => setActiveTab('deposit')}
                    >
                        Add Collateral
                    </button>
                    <button
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'repay'
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:bg-white/5'
                            }`}
                        onClick={() => setActiveTab('repay')}
                    >
                        Repay Debt
                    </button>
                </div>

                {/* Amount input */}
                <div className="px-6 py-4">
                    <label className="text-xs text-slate-400 block mb-2">
                        {activeTab === 'deposit' ? 'ETH Amount to Deposit' : 'RUSD Amount to Repay'}
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3
                         text-white font-mono text-lg focus:outline-none focus:border-indigo-500/50
                         focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            step="0.01"
                            min="0"
                        />
                        <button
                            onClick={() => setAmount(requiredTopUp)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-500/20 text-indigo-400
                         text-xs font-semibold rounded-lg hover:bg-indigo-500/30 transition-colors"
                        >
                            Suggested
                        </button>
                    </div>

                    {/* Projected health factor */}
                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-400">New Health Factor:</span>
                        <span className="font-mono font-bold text-green-400">{calcNewHF()}</span>
                    </div>
                </div>

                {/* Action button */}
                <div className="px-6 pb-6">
                    <button
                        onClick={handleAction}
                        disabled={isLoading || !amount || parseFloat(amount) <= 0}
                        className={`
              w-full py-4 rounded-2xl font-bold text-white text-base
              transition-all duration-300 shadow-xl
              ${isLoading
                                ? 'bg-slate-700 cursor-wait'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-[1.02] active:scale-[0.98] shadow-indigo-500/25'
                            }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing Transaction...
                            </span>
                        ) : (
                            `${activeTab === 'deposit' ? '⬆️ Deposit' : '💰 Repay'} ${amount || '0'} ${activeTab === 'deposit' ? 'ETH' : 'RUSD'}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
