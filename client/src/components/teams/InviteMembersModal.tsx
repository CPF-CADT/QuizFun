import React, { useState, useEffect } from 'react';
import { X, Link, Mail, Search, UserPlus, AlertCircle, Copy, Check } from 'lucide-react';
import { teamApi } from '../../service/teamApi';
import { useDebounce } from '../../hook/useDebounce';
import type { IUser } from '../../service/api';
import type { ITeam } from '../../types/team';

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: ITeam; // Pass the full team object
  onInviteSuccess: () => void;
}

type InviteTab = 'link' | 'email';

export const InviteMembersModal: React.FC<InviteMembersModalProps> = ({ isOpen, onClose, team, onInviteSuccess }) => {
  const [activeTab, setActiveTab] = useState<InviteTab>('link');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const inviteLink = `${window.location.origin}/join-team/${team.inviteCode}`;

  useEffect(() => {
    // Only search when the "email" tab is active
    if (debouncedSearchTerm && activeTab === 'email') {
      setIsSearching(true);
      const excludeIds = selectedUsers.map(u => u._id);
      teamApi.searchUsers(debouncedSearchTerm, excludeIds)
        .then(response => setSearchResults(response.data))
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false));
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm, activeTab, selectedUsers]);

  const handleSelectUser = (user: IUser) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchTerm(''); // Clear search input after selection
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user._id !== userId));
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) return;

    setIsInviting(true);
    setError(null);
    try {
        const userIds = selectedUsers.map(user => user._id);
        await teamApi.inviteMembers(team._id, { userIds });
        onInviteSuccess(); // Trigger refetch on the parent component
        onClose(); // Close the modal on success
    } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to send invitations. Please try again.');
        console.error(err);
    } finally {
        setIsInviting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl border">
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Invite Members to {team.name}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
        </header>

        {/* --- TABS FOR INVITE OPTIONS --- */}
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('link')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${activeTab === 'link' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}><Link size={16} /> Invite with Link</button>
          <button onClick={() => setActiveTab('email')} className={`flex items-center gap-2 px-4 py-2 font-semibold ${activeTab === 'email' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}><Mail size={16} /> Invite by Search</button>
        </div>

        {/* --- INVITE BY LINK CONTENT --- */}
        {activeTab === 'link' && (
          <div>
            <p className="text-gray-600 mb-4">Anyone with this link can join your team. Share it wisely.</p>
            <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg border">
              <Link className="text-gray-400 mx-2" size={18} />
              <input type="text" readOnly value={inviteLink} className="bg-transparent flex-1 outline-none text-gray-700 text-sm" />
              <button onClick={handleCopyLink} className="bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 rounded-md px-4 py-1.5 text-sm w-28 flex items-center justify-center gap-2">
                {hasCopied ? <><Check size={16}/> Copied!</> : <><Copy size={16}/> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* --- INVITE BY SEARCH CONTENT --- */}
        {activeTab === 'email' && (
          <div>
            <p className="text-gray-600 mb-4">Search for users by name or email to add them to your team.</p>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
                {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>}
            </div>

            {searchResults.length > 0 && (
                <div className="border border-gray-200 rounded-lg mt-2 max-h-48 overflow-y-auto">
                {searchResults.map(user => (
                    <div key={user._id} onClick={() => handleSelectUser(user)} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                    <img src={user.profileUrl || `https://i.pravatar.cc/150?u=${user._id}`} alt={user.name} className="w-8 h-8 rounded-full" />
                    <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    </div>
                ))}
                </div>
            )}

            {selectedUsers.length > 0 && (
                <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Selected for Invite:</h4>
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map(user => (
                    <div key={user._id} className="bg-indigo-100 text-indigo-800 text-sm font-semibold pl-2 pr-1 py-1 rounded-full flex items-center gap-1">
                        {user.name}
                        <button onClick={() => handleRemoveUser(user._id)} className="hover:bg-indigo-200 rounded-full"><X size={14} /></button>
                    </div>
                    ))}
                </div>
                </div>
            )}
            
            <footer className="mt-8 flex justify-between items-center">
                {error && <div className="text-red-600 text-sm flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
                <div className="flex-grow"></div>
                <button 
                    onClick={handleSendInvites}
                    disabled={selectedUsers.length === 0 || isInviting}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isInviting ? 'Sending...' : <><UserPlus size={16} /> Invite {selectedUsers.length} User(s)</>}
                </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};
