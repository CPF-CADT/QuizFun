import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Users, BookCopy, BarChartHorizontal, UserPlus } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { MemberList } from '../components/teams/MemberList';
import { TeamQuizList } from '../components/teams/TeamQuizList';
import { TeamAnalytics } from '../components/teams/TeamAnalytics'; // ✅ IMPORT
import { InviteMembersModal } from '../components/teams/InviteMembersModal';
import { teamApi } from '../service/teamApi';
import type { ITeam } from '../types/team';
import { useAuth } from '../context/AuthContext';

type ActiveTab = 'members' | 'quizzes' | 'analytics';

const TeamManagementPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('quizzes');
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [team, setTeam] = useState<ITeam | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useAuth();
    const { teamId } = useParams<{ teamId: string }>();

    const fetchTeamData = () => {
        if (!teamId) return;
        setIsLoading(true);
        teamApi.getTeamById(teamId)
            .then(response => setTeam(response.data))
            .catch(error => console.error("Failed to fetch team details", error))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchTeamData();
    }, [teamId]);

    const isOwner = useMemo(() => {
        if (!team || !user) return false;
        // @ts-ignore
        const currentUserMemberInfo = team.members.find(member => member.userId?._id === user._id);
        return currentUserMemberInfo?.role === 'owner';
    }, [team, user]);

    const renderTabContent = () => {
        if (isLoading) return <div className="text-center p-10">Loading team data...</div>;
        if (!team) return <div className="text-center p-10">Team not found.</div>;

        switch (activeTab) {
            case 'members': 
                return <MemberList members={team.members} />;
            case 'quizzes': 
                return <TeamQuizList teamId={teamId!} isOwner={isOwner} />;
            case 'analytics': 
                // ✅ RENDER the new component
                return <TeamAnalytics />;
            default: return null;
        }
    };

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar activeSection="teams" setActiveSection={() => {}} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} currentTime={new Date()} />
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                             <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 capitalize">{team?.name || 'Loading...'}</h1>
                                <p className="text-lg text-gray-500 mt-2">{team?.description || 'Manage members, quizzes, and performance.'}</p>
                            </div>
                            {isOwner && (
                                <button onClick={() => setInviteModalOpen(true)} className="mt-4 md:mt-0 flex-shrink-0 bg-white border-2 border-indigo-600 hover:bg-indigo-50 text-indigo-600 py-3 px-6 rounded-xl font-semibold flex items-center gap-2">
                                    <UserPlus className="w-5 h-5" /> Invite Members
                                </button>
                            )}
                        </header>
                        <nav className="flex gap-2 border-b border-gray-200 mb-8">
                            <button onClick={() => setActiveTab('members')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'members' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'}`}><Users size={16}/> Members</button>
                            <button onClick={() => setActiveTab('quizzes')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'quizzes' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'}`}><BookCopy size={16}/> Quizzes</button>
                             {/* ✅ This button now just switches the tab */}
                            <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'analytics' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100 text-gray-600'}`}><BarChartHorizontal size={16}/> Analytics</button>
                        </nav>
                        <div>{renderTabContent()}</div>
                    </div>
                </main>
            </div>
            {team && <InviteMembersModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} team={team} onInviteSuccess={fetchTeamData} />}
        </>
    );
};

export default TeamManagementPage;