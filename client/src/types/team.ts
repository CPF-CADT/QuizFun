// A user's role within a team
export type TeamRole = 'owner' | 'member';

// Represents a team card on the dashboard
export interface ITeam {
  _id: string;
  name: string;
  description?: string;
  inviteCode: string;
  members: any[]; // Define ITeamMember if you need more detail
  createdBy: string;
  memberCount?: number; // This can be added by an aggregation on the backend
}

// Detailed information about a single team member

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl: string;
  role: TeamRole;
}

// A quiz that is private to a team
export interface TeamQuiz {
  _id: string; // The ID of the TeamQuiz document
  quizId: { // Populated quiz details
    _id: string;
    title: string;
    description: string;
    questions: any[]; // Define more strictly if needed
  };
  mode: 'solo' | 'multiplayer';
}
