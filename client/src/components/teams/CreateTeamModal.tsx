import React, { useState } from 'react';
import { X, CheckCircle, Link } from 'lucide-react';
import { teamApi } from '../../service/teamApi'; // Adjust path if needed
import type {ITeam as Team } from '../../types/team'; // Adjust path if needed

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose }) => {
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdTeam, setCreatedTeam] = useState<Team | null>(null);
    const [hasCopied, setHasCopied] = useState(false);

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName) {
            setError("Team name is required.");
            return;
        }
        setIsCreating(true);
        setError(null);
        try {
            const response = await teamApi.createTeam({ name: teamName, description });
            setCreatedTeam(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create team. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = () => {
        if (!createdTeam) return;
        // @ts-ignore - Assuming inviteCode is on the ITeam response
        const inviteLink = `${window.location.origin}/join-team/${createdTeam.inviteCode}`;
        navigator.clipboard.writeText(inviteLink);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setTeamName('');
            setDescription('');
            setCreatedTeam(null);
            setError(null);
            setHasCopied(false);
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg border border-gray-200 shadow-xl">
                {!createdTeam ? (
                    <>
                        <header className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Create a New Team</h2>
                            <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={20} /></button>
                        </header>
                        <form onSubmit={handleCreateTeam} className="space-y-4">
                            <div>
                                <label htmlFor="teamName" className="block mb-2 font-medium text-gray-600">Team Name</label>
                                <input type="text" id="teamName" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g., Frontend Wizards" required className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block mb-2 font-medium text-gray-600">Description</label>
                                <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this team about?" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <footer className="mt-8 flex justify-end">
                                <button type="submit" disabled={isCreating} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md disabled:opacity-50 transition-opacity">
                                    {isCreating ? 'Creating...' : 'Create Team'}
                                </button>
                            </footer>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Team Created!</h2>
                        <p className="text-gray-600 mb-6">Share this code or link to invite members.</p>
                        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg border mb-6">
                            <Link className="text-gray-400 mx-2" size={18}/>
                            {/* @ts-ignore */}
                            <input type="text" readOnly value={`${window.location.origin}/join-team/${createdTeam.inviteCode}`} className="bg-transparent flex-1 outline-none text-gray-700 text-sm"/>
                            <button onClick={handleCopy} className="bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 rounded-md px-3 py-1.5 text-sm w-24">{hasCopied ? 'Copied!' : 'Copy'}</button>
                        </div>
                        <button onClick={handleClose} className="bg-gray-200 text-gray-800 font-bold py-2.5 px-8 rounded-lg hover:bg-gray-300">Done</button>
                    </div>
                )}
            </div>
        </div>
    );
};
