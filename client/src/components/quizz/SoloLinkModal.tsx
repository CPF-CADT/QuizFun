// src/components/quizz/SoloLinkModal.tsx (NEW FILE)

import React, { useState } from 'react';
import { Link as LinkIcon, Check, X } from 'lucide-react';

interface SoloLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizId: string | null;
}

export const SoloLinkModal: React.FC<SoloLinkModalProps> = ({ isOpen, onClose, quizId }) => {
    const [isCopied, setIsCopied] = useState(false);
    if (!isOpen || !quizId) return null;

    const soloLink = `${window.location.origin}/solo/${quizId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(soloLink).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <LinkIcon className="text-indigo-500" /> Share Solo Link
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-gray-600 mb-4">
                    Anyone with this link can play this quiz on their own time. Their results will not affect multiplayer leaderboards.
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={soloLink}
                        className="w-full bg-gray-100 p-3 rounded-lg text-sm text-gray-800 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                        onClick={handleCopy}
                        className={`w-32 flex items-center justify-center font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-sm ${
                            isCopied
                                ? 'bg-emerald-500 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                    >
                        {isCopied ? <><Check size={16} className="mr-2" /> Copied!</> : 'Copy Link'}
                    </button>
                </div>
            </div>
        </div>
    );
};