import React from 'react';
import { Crown, Users, Percent, Eye } from 'lucide-react';
import type { IActivitySession } from '../../service/reportApi';

interface HostSessionCardProps {
    session: IActivitySession;
    onViewResult: (sessionId: string) => void; 
}

export const HostSessionCard: React.FC<HostSessionCardProps> = ({ session, onViewResult }) => {
    return (
        <div className="bg-white/60 p-4 rounded-xl border border-gray-200/80 hover:bg-white/90 transition-all duration-200 group">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-1">
                        <Crown className="w-4 h-4" />
                        <span>YOU HOSTED</span>
                    </div>
                    <p className="font-semibold text-gray-800 group-hover:text-purple-800">{session.quizTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(session.endedAt).toLocaleString()}</p>
                </div>
                <button
                    onClick={() => onViewResult(session._id)}
                    className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                >
                    <Eye className="w-3 h-3" />
                    Results 
                </button>
            </div>
            <div className="flex items-center justify-start gap-6 mt-3 pt-3 border-t border-gray-200/80 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-blue-500" />
                    <div>
                        <span className="font-bold text-gray-800">{session.playerCount}</span> Players
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Percent className="w-4 h-4 text-green-500" />
                    <div>
                        <span className="font-bold text-gray-800">{session.averageScore?.toFixed(0) || 0}%</span> Avg Score
                    </div>
                </div>
            </div>
        </div>
    );
};