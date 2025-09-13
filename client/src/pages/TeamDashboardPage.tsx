import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Users, Menu } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import { CreateTeamModal } from '../components/teams/CreateTeamModal';
import { teamApi } from '../service/teamApi';
import type { ITeam as Team } from '../types/team';

const TeamDashboardPage: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Fetches the initial list of teams when the component loads
    useEffect(() => {
        setIsLoading(true);
        teamApi.getUserTeams()
            .then(response => {
                setTeams(response.data);
            })
            .catch(error => console.error("Failed to fetch teams:", error))
            .finally(() => setIsLoading(false));
    }, []);

    const handleNavigation = (teamId: string) => {
        navigate(`/teams/${teamId}`);
    };

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar 
                    activeSection="teams" 
                    setActiveSection={() => {}} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    currentTime={new Date()} 
                />
                
                <main className="flex-1 p-6 min-w-0">
                    <div className="max-w-7xl mx-auto">
                        {/* Mobile Header */}
                        <header className="flex items-center justify-between mb-8 lg:hidden">
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-md text-slate-700 hover:bg-slate-200"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl font-bold text-slate-800">My Teams</h1>
                            <button 
                                onClick={() => setModalOpen(true)} 
                                className="p-2 rounded-md text-indigo-600 hover:bg-indigo-100"
                            >
                                <PlusCircle className="w-6 h-6" />
                            </button>
                        </header>

                        {/* Desktop Header */}
                        <header className="hidden lg:flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                            <div>
                                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2">My Teams</h1>
                                <p className="text-lg text-gray-500">Create, manage, and participate in team quizzes.</p>
                            </div>
                            <button 
                                onClick={() => setModalOpen(true)} 
                                className="mt-4 md:mt-0 flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Create New Team
                            </button>
                        </header>
                        
                        {isLoading ? <p>Loading teams...</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teams.map((team) => (
                                    <div key={team._id} onClick={() => handleNavigation(team._id)} className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all duration-300">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h2>
                                            <p className="text-gray-600 mb-4 h-16 text-sm">{team.description}</p>
                                            <div className="flex items-center text-gray-500">
                                                <Users size={16} className="mr-2" />
                                                {/* @ts-ignore */}
                                                <span className="font-medium">{team.members?.length || team.memberCount || 0} Members</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <CreateTeamModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
        </>
    );
};

export default TeamDashboardPage;