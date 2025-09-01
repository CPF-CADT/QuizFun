import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { TeamMember } from '../../types/team';

interface MemberListProps {
    members: TeamMember[]; // Receive members as a prop
}

const RoleBadge: React.FC<{ role: TeamMember['role'] }> = ({ role }) => {
//   const isOwner = role === 'owner';
//   const badgeStyle = isOwner ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-blue-100 text-blue-800 border-blue-200";
  return <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize`}><ShieldCheck size={14} />{role}</span>;
};

export const MemberList: React.FC<MemberListProps> = ({ members }) => {
    if (!members || members.length === 0) {
        return <p className="text-center p-8 text-gray-500">No members found in this team yet.</p>;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <ul className="divide-y divide-gray-200">
                {members.map((member) => (
                    // @ts-ignore - Assuming member.userId is populated with user details
                    <li key={member.userId._id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                            {/* @ts-ignore */}
                            <img src={member.userId.profileUrl || `https://i.pravatar.cc/150?u=${member.userId._id}`} alt={member.userId.name} className="w-12 h-12 rounded-full" />
                            <div>
                                {/* @ts-ignore */}
                                <p className="font-bold text-lg text-gray-900">{member.userId.name}</p>
                                <RoleBadge role={member.role} />
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
