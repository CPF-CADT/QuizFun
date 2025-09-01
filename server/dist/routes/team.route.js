"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controller/team.controller");
const authenicate_middleware_1 = require("../middleware/authenicate.middleware");
const router = (0, express_1.Router)();
router.get('/invite/:inviteCode', team_controller_1.TeamController.getTeamByInviteCode);
router.use(authenicate_middleware_1.authenticateToken);
// --- Core Team Routes ---
router.post('/', team_controller_1.TeamController.createTeam);
router.get('/', team_controller_1.TeamController.getUserTeams);
router.get('/:teamId', team_controller_1.TeamController.getTeamById);
router.post('/join', team_controller_1.TeamController.joinTeam);
// --- Member Management ---
router.get('/:teamId/members', team_controller_1.TeamController.getTeamMembers);
router.post('/:teamId/invite', team_controller_1.TeamController.inviteMembers);
// --- Team Quiz & Session Management ---
router.post('/:teamId/quizzes', team_controller_1.TeamController.addQuizToTeam);
router.get('/:teamId/sessions', team_controller_1.TeamController.getAssignedQuizzes);
router.post('/solo-session', team_controller_1.TeamController.startTeamSoloSession);
router.get('/:teamId/analytics', team_controller_1.TeamController.getTeamAnalytics);
router.get('/analytics/session/:sessionId', team_controller_1.TeamController.getSessionAnalytics);
router.get('/:teamId/analytics/quiz/:quizId', team_controller_1.TeamController.getQuizAnalytics);
exports.default = router;
