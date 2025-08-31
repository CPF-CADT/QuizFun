import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { teamApi } from '../service/teamApi';
import type { ITeam } from '../types/team';
import { useAuth } from '../context/AuthContext';

const JoinTeamPage: React.FC = () => {
    const { inviteCode } = useParams<{ inviteCode: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [team, setTeam] = useState<ITeam | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [joinSuccess, setJoinSuccess] = useState(false);

    useEffect(() => {
        if (!inviteCode) {
            setError("No invite code provided.");
            setIsLoading(false);
            return;
        }

        teamApi.getTeamByInviteCode(inviteCode)
            .then(response => {
                setTeam(response.data);
            })
            .catch(() => {
                setError("This invite link is invalid or has expired.");
            })
            .finally(() => {
                setIsLoading(false);
            });

    }, [inviteCode]);

    const handleJoinTeam = async () => {
        if (!inviteCode) return;

        if (!isAuthenticated) {
            // Redirect to login, passing the current location to return to after logging in
            navigate('/login', { state: { from: location } });
            return;
        }

        setIsJoining(true);
        setError(null);
        try {
            // --- FIX: Capture the response from the API call ---
            const response = await teamApi.joinTeam(inviteCode);
            setJoinSuccess(true);
            
            // --- FIX: Use the teamId from the response to navigate ---
            // After a 2-second delay to show the success message, redirect the user.
            setTimeout(() => {
                navigate(`/teams/${response.data.teamId}`);
            }, 2000);

        } catch (err: any) {
            setError(err.response?.data?.message || "Could not join the team. You may already be a member.");
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg border p-8 text-center">
                {isLoading && <p>Loading team information...</p>}
                
                {error && !joinSuccess && (
                    <>
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">Invite Invalid</h1>
                        <p className="text-gray-600 mt-2">{error}</p>
                        <button onClick={() => navigate('/')} className="mt-6 w-full bg-gray-200 text-gray-800 font-bold py-3 rounded-lg">Go to Homepage</button>
                    </>
                )}

                {!isLoading && !error && team && !joinSuccess && (
                    <>
                        <Users className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">Join {team.name}</h1>
                        <p className="text-gray-600 mt-2">{team.description}</p>
                        <p className="text-sm text-gray-500 mt-4">{team.memberCount} members</p>
                        
                        <button 
                            onClick={handleJoinTeam} 
                            disabled={isJoining}
                            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {isJoining ? 'Joining...' : 'Accept Invitation'}
                        </button>
                    </>
                )}

                {joinSuccess && team && (
                     <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800">Welcome to the Team!</h1>
                        <p className="text-gray-600 mt-2">You are now a member of {team.name}. Redirecting...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default JoinTeamPage;
