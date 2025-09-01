import { Router } from 'express';
import { TeamController } from '../controller/team.controller';
import { authenticateToken } from '../middleware/authenicate.middleware';

const router = Router();

router.get('/invite/:inviteCode', TeamController.getTeamByInviteCode);
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
router.post('/:teamId/quizzes', TeamController.addQuizToTeam); 
router.get('/:teamId/sessions', TeamController.getAssignedQuizzes);
router.post('/solo-session', TeamController.startTeamSoloSession);

router.get('/:teamId/analytics', TeamController.getTeamAnalytics); 
router.get('/analytics/session/:sessionId', TeamController.getSessionAnalytics);
router.get('/:teamId/analytics/quiz/:quizId', TeamController.getQuizAnalytics);

export default router;