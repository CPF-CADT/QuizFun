"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_controller_1 = require("../controller/team.controller");
const authenicate_middleware_1 = require("../middleware/authenicate.middleware");
const router = (0, express_1.Router)();
// This public route allows non-logged-in users to view team invite pages.
router.get('/invite/:inviteCode', team_controller_1.TeamController.getTeamByInviteCode);
// Protect all subsequent routes in this file with authentication.
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
// Adds a quiz from a user's library to the team (mode: 'solo' or 'multiplayer')
router.post('/:teamId/quizzes', team_controller_1.TeamController.addQuizToTeam);
// Gets ALL assigned quizzes for a team.
router.get('/:teamId/sessions', team_controller_1.TeamController.getAssignedQuizzes);
// Creates a solo game session record for a team member.
router.post('/solo-session', team_controller_1.TeamController.startTeamSoloSession);
// --- Team Analytics ---
router.get('/:teamId/analytics/overview', team_controller_1.TeamController.getTeamAnalyticsOverview);
router.get('/analytics/session/:sessionId', team_controller_1.TeamController.getTeamSessionDetails);
exports.default = router;
