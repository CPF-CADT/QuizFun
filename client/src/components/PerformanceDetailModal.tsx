import React from 'react';
import { usePerformanceData, type PlayerIdentifier } from '../hook/usePerformanceData';
import { PerformanceView } from './ui/PerformanceView';

const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

interface PerformanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionId: string;
    playerIdentifier: PlayerIdentifier;
}

export const PerformanceDetailModal: React.FC<PerformanceModalProps> = ({ isOpen, onClose, sessionId, playerIdentifier }) => {
    // All complex logic is now in the hook
    const { loading, error, player, performance, summary } = usePerformanceData(sessionId, playerIdentifier);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-7xl h-[90vh] bg-slate-900 border border-purple-800 rounded-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h1 className="text-3xl font-bold">Performance Review</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors"><CloseIcon /></button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {loading && <p className="animate-pulse text-center text-lg">Loading Details...</p>}
                    {error && <p className="text-red-400 text-center text-lg">{error}</p>}
                    {!loading && !error && (
                        <PerformanceView
                            player={player}
                            performance={performance}
                            summary={summary}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};