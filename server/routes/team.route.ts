import { Router } from 'express';
import { TeamController } from '../controller/team.controller';
import { authenticateToken } from '../middleware/authenicate.middleware';

const router = Router();

// This public route allows non-logged-in users to view team invite pages.
router.get('/invite/:inviteCode', TeamController.getTeamByInviteCode);

// Protect all subsequent routes in this file with authentication.
router.use(authenticateToken);

// --- Core Team Routes ---
router.post('/', TeamController.createTeam);
router.get('/', TeamController.getUserTeams);
router.get('/:teamId', TeamController.getTeamById);
router.post('/join', TeamController.joinTeam);

// --- Member Management ---
router.get('/:teamId/members', TeamController.getTeamMembers);
router.post('/:teamId/invite', TeamController.inviteMembers);

// --- Team Quiz & Session Management ---
// Adds a quiz from a user's library to the team (mode: 'solo' or 'multiplayer')
router.post('/:teamId/quizzes', TeamController.addQuizToTeam); 

// Gets ALL assigned quizzes for a team.
router.get('/:teamId/sessions', TeamController.getAssignedQuizzes);

// Creates a solo game session record for a team member.
router.post('/solo-session', TeamController.startTeamSoloSession);

// --- Team Analytics ---
router.get('/:teamId/analytics/overview', TeamController.getTeamAnalyticsOverview);
router.get('/analytics/session/:sessionId', TeamController.getTeamSessionDetails);

export default router;