import { apiClient } from './api';
import type { ITeam, TeamMember } from '../types/team';
import type { IUser } from './api';

export interface ITeamCreationPayload {
    name: string;
    description?: string;
}

export interface IInviteMembersPayload {
    userIds: string[];
}

export interface IJoinTeamResponse {
    message: string;
    teamId: string;
}

export interface ISoloSessionResponse {
    sessionId: string;
    message: string;
}
export interface ITeamAnalytics {
    leaderboard: {
        userId: string;
        name: string;
        profileUrl?: string;
        totalScore: number;
        quizzesPlayed: number;
    }[];
    pastSessions: {
        latestSessionId: string;
        quizId: string;
        quizTitle: string;
        endedAt: string;
        participantCount: number;
        playCount: number;
    }[];
}
export interface ITeamQuizAnalytics {
    quizTitle: string;
    participants: {
        userId: string;
        name: string;
        profileUrl?: string;
        score: number;
        sessionId: string; // The session of their best attempt
    }[];
}

export interface ISessionAnalytics {
    quizTitle: string;
    endedAt: string;
    participants: {
        userId: string;
        name: string;
        profileUrl?: string;
        score: number;
        rank: number;
    }[];
}


export const teamApi = {
    // --- Core Team Management ---
    createTeam: (data: ITeamCreationPayload) => {
        return apiClient.post<ITeam>('/teams', data);
    },
    getUserTeams: () => {
        return apiClient.get<ITeam[]>('/teams');
    },
    getTeamById: (teamId: string) => {
        return apiClient.get<ITeam>(`/teams/${teamId}`);
    },

    // --- Membership & Invites ---
    joinTeam: (inviteCode: string) => {
        return apiClient.post<IJoinTeamResponse>('/teams/join', { inviteCode });
    },
    getTeamByInviteCode: (inviteCode: string) => {
        return apiClient.get<ITeam>(`/teams/invite/${inviteCode}`);
    },
    getTeamMembers: (teamId: string) => {
        return apiClient.get<TeamMember[]>(`/teams/${teamId}/members`);
    },
    inviteMembers: (teamId: string, data: IInviteMembersPayload) => {
        return apiClient.post(`/teams/${teamId}/invite`, data);
    },
    searchUsers: (query: string, excludeIds?: string[]) => {
        const params: { q: string; exclude?: string } = { q: query };
        if (excludeIds && excludeIds.length > 0) {
            params.exclude = excludeIds.join(',');
        }
        return apiClient.get<IUser[]>(`/users/search`, { params });
    },

    // --- Team Quiz Management ---
    /**
    * Adds a quiz from the user's library to the team.
    */
    addQuizToTeam: (teamId: string, quizId: string, mode: 'solo' | 'multiplayer') => {
        return apiClient.post(`/teams/${teamId}/quizzes`, { quizId, mode });
    },

    /**
    * Fetches all quizzes assigned to a team from the library.
    */
    getAssignedQuizzes: (teamId: string) => {
        // This route was named getTeamSessions on the backend, but this name is clearer.
        return apiClient.get(`/teams/${teamId}/sessions`);
    },

    /**
    * Starts a solo game session for a team member and returns the new session ID.
    */
    startTeamSoloSession: (teamId: string, quizId: string) => {
        return apiClient.post<ISoloSessionResponse>(`/teams/solo-session`, { teamId, quizId });
    },
    getTeamAnalytics: (teamId: string) => {
        return apiClient.get<ITeamAnalytics>(`/teams/${teamId}/analytics`);
    },

    getSessionAnalytics: (sessionId: string) => {
        return apiClient.get<ISessionAnalytics>(`/teams/analytics/session/${sessionId}`);
    },
    getTeamQuizAnalytics: (teamId: string, quizId: string) => {
        return apiClient.get<ITeamQuizAnalytics>(`/teams/${teamId}/analytics/quiz/${quizId}`);
    },

};