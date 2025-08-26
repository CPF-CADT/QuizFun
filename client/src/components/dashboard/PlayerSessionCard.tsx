import React from 'react';
import { User, Target, Award, Eye } from 'lucide-react';
import type { IActivitySession } from '../../service/reportApi';

interface PlayerSessionCardProps {
    session: IActivitySession;
    onViewResults: (sessionId: string) => void;
}

export const PlayerSessionCard: React.FC<PlayerSessionCardProps> = ({ session, onViewResults }) => {
    return (
        <div className="bg-white/60 p-4 rounded-xl border border-gray-200/80 hover:bg-white/90 transition-all duration-200 group">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-1">
                        <User className="w-4 h-4" />
                        <span>YOU PLAYED</span>
                    </div>
                    <p className="font-semibold text-gray-800 group-hover:text-emerald-800">{session.quizTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(session.endedAt).toLocaleString()}</p>
                </div>
                 <button
                    onClick={() => onViewResults(session._id)}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors"
                >
                    <Eye className="w-3 h-3" />
                    Results
                </button>
            </div>
            <div className="flex items-center justify-start gap-6 mt-3 pt-3 border-t border-gray-200/80 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Target className="w-4 h-4 text-red-500" />
                    <div>
                        Your Score: <span className="font-bold text-gray-800">{session.playerResult?.finalScore || 0}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <div>
                        Your Rank: <span className="font-bold text-gray-800">#{session.playerResult?.finalRank || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};