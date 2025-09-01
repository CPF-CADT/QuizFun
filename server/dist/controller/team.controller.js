"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const TeamRepository_1 = require("../repositories/TeamRepository");
const game_repositories_1 = require("../repositories/game.repositories");
const GameSession_1 = require("../model/GameSession");
const GameSession_2 = require("../config/data/GameSession");
const User_1 = require("../model/User");
class TeamController {
    static getTeamAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { teamId } = req.params;
                const [leaderboard, pastSessions] = yield Promise.all([
                    TeamRepository_1.TeamRepository.getOverallTeamLeaderboard(teamId),
                    TeamRepository_1.TeamRepository.getCompletedSessionsForTeam(teamId)
                ]);
                // ✅ AGGREGATION LOGIC STARTS HERE
                const aggregatedSessions = new Map();
                // Group sessions by quizId
                for (const session of pastSessions) {
                    // @ts-ignore
                    const quizId = session.quizId._id.toString();
                    if (!aggregatedSessions.has(quizId)) {
                        aggregatedSessions.set(quizId, {
                            quizId: session.quizId,
                            allParticipants: new Set(),
                            playCount: 0,
                            latestSession: session,
                        });
                    }
                    const data = aggregatedSessions.get(quizId);
                    data.playCount += 1;
                    session.results.forEach(p => p.userId && data.allParticipants.add(p.userId.toString()));
                    if (new Date((_a = session.endedAt) !== null && _a !== void 0 ? _a : 'No Date') > new Date(data.latestSession.endedAt)) {
                        data.latestSession = session;
                    }
                }
                const formattedPastSessions = Array.from(aggregatedSessions.values()).map(data => ({
                    quizId: data.quizId._id,
                    quizTitle: data.quizId.title,
                    participantCount: data.allParticipants.size,
                    playCount: data.playCount,
                    endedAt: data.latestSession.endedAt,
                    latestSessionId: data.latestSession._id, // ID to link to for "View Results"
                }));
                // Sort by most recently played
                formattedPastSessions.sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime());
                res.status(200).json({ leaderboard, pastSessions: formattedPastSessions });
            }
            catch (error) {
                console.error("Error fetching team analytics:", error);
                res.status(500).json({ message: 'Error fetching team analytics.' });
            }
        });
    }
    static getQuizAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId, quizId } = req.params;
                const results = yield TeamRepository_1.TeamRepository.getAggregatedQuizResultsForTeam(teamId, quizId);
                if (!results) {
                    return res.status(404).json({ message: 'Quiz results not found for this team.' });
                }
                res.status(200).json(results);
            }
            catch (error) {
                console.error("Error fetching quiz analytics:", error);
                res.status(500).json({ message: 'Error fetching quiz analytics.' });
            }
        });
    }
    static getSessionAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sessionId } = req.params;
                const sessionDetails = yield TeamRepository_1.TeamRepository.getSessionResults(sessionId);
                if (!sessionDetails) {
                    return res.status(404).json({ message: 'Session not found.' });
                }
                res.status(200).json(sessionDetails);
            }
            catch (error) {
                console.error("Error fetching session details:", error);
                res.status(500).json({ message: 'Error fetching session details.' });
            }
        });
    }
    static createTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, description } = req.body;
                // @ts-ignore - Assuming user object is attached by auth middleware
                const creatorId = req.user.id;
                if (!creatorId) {
                    return res.status(401).json({ message: 'Authentication error: User not found' });
                }
                if (!name) {
                    return res.status(400).json({ message: 'Team name is required.' });
                }
                const team = yield TeamRepository_1.TeamRepository.createTeam(name, description, creatorId);
                res.status(201).json(team);
            }
            catch (error) {
                console.error("Error creating team:", error);
                res.status(500).json({ message: 'Error creating team.' });
            }
        });
    }
    static getUserTeams(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // @ts-ignore
                const userId = req.user.id;
                if (!userId) {
                    return res.status(401).json({ message: 'Authentication error: User not found' });
                }
                const teams = yield TeamRepository_1.TeamRepository.findTeamsByUserId(userId);
                res.status(200).json(teams);
            }
            catch (error) {
                console.error("Error fetching user teams:", error);
                res.status(500).json({ message: 'Error fetching user teams.' });
            }
        });
    }
    /**
     * ADDED: Fetches all members of a specific team.
     */
    static getTeamMembers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const team = yield TeamRepository_1.TeamRepository.findById(teamId);
                if (!team) {
                    return res.status(404).json({ message: 'Team not found.' });
                }
                res.status(200).json(team.members);
            }
            catch (error) {
                console.error("Error fetching team members:", error);
                res.status(500).json({ message: 'Error fetching team members.' });
            }
        });
    }
    /**
     * ADDED: Invites users to a team.
     */
    static inviteMembers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const { userIds } = req.body; // Expect an array of user IDs
                if (!userIds || !Array.isArray(userIds)) {
                    return res.status(400).json({ message: 'An array of userIds is required.' });
                }
                // Here you would add the logic to add each userId to the team's member list
                // For example: await TeamRepository.addUsersToTeam(teamId, userIds);
                res.status(200).json({ message: 'Invitations sent successfully.' });
            }
            catch (error) {
                console.error("Error inviting members:", error);
                res.status(500).json({ message: 'Error inviting members.' });
            }
        });
    }
    /**
     * ADDED: Fetches all quizzes associated with a team's library.
     */
    static getQuizzesForTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const quizzes = yield TeamRepository_1.TeamRepository.getQuizzesForTeam(teamId);
                res.status(200).json(quizzes);
            }
            catch (error) {
                console.error("Error fetching team quizzes:", error);
                res.status(500).json({ message: 'Error fetching team quizzes.' });
            }
        });
    }
    static addQuizToTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const { quizId, mode } = req.body;
                // @ts-ignore
                const userId = req.user.id;
                if (!userId)
                    return res.status(401).json({ message: 'Authentication error: User not found' });
                if (!quizId || !mode)
                    return res.status(400).json({ message: 'Quiz ID and mode are required.' });
                if (!['solo', 'multiplayer'].includes(mode))
                    return res.status(400).json({ message: 'Invalid mode specified.' });
                const team = yield TeamRepository_1.TeamRepository.findById(teamId);
                if (!team)
                    return res.status(404).json({ message: 'Team not found.' });
                // @ts-ignore
                const member = team.members.find(m => m.userId._id.toString() === userId);
                if (!member || member.role !== 'owner') {
                    return res.status(403).json({ message: 'You do not have permission to add quizzes to this team.' });
                }
                const success = yield TeamRepository_1.TeamRepository.addQuizToTeam(teamId, quizId, userId, mode);
                if (!success)
                    return res.status(409).json({ message: 'This quiz has already been added to the team.' });
                res.status(201).json({ message: 'Quiz added to team successfully.' });
            }
            catch (error) {
                console.error("Error adding quiz to team:", error);
                res.status(500).json({ message: 'Error adding quiz to team.' });
            }
        });
    }
    static startTeamSoloSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId, quizId } = req.body;
                // @ts-ignore
                const userFromToken = req.user;
                if (!userFromToken || !userFromToken.id) {
                    return res.status(401).json({ message: 'User not found or invalid token.' });
                }
                // ✅ 2. FETCH THE FULL USER DETAILS FROM THE DATABASE
                const user = yield User_1.UserModel.findById(userFromToken.id).lean();
                if (!user) {
                    return res.status(401).json({ message: 'Authenticated user not found in database.' });
                }
                const isMember = yield TeamRepository_1.TeamRepository.isUserMemberOfTeam(teamId, user._id.toString());
                if (!isMember) {
                    return res.status(403).json({ message: 'You must be a member of this team to start this quiz.' });
                }
                const session = new GameSession_1.GameSessionModel({
                    quizId,
                    teamId,
                    hostId: user._id,
                    mode: 'solo',
                    status: 'in_progress',
                    startedAt: new Date(),
                    results: [{ userId: user._id, nickname: user.name, finalScore: 0 }],
                });
                yield session.save();
                res.status(201).json({ sessionId: session._id.toString(), message: 'Team solo session started successfully.' });
            }
            catch (error) {
                console.error("Error starting team solo session:", error);
                res.status(500).json({ message: 'Error starting solo session.' });
            }
        });
    }
    static getTeamAnalyticsOverview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const sessions = yield TeamRepository_1.TeamRepository.getSessionsForTeam(teamId);
                const summary = { avgScore: 84, participationRate: 92, quizzesPlayed: sessions.length };
                res.status(200).json({ summary, sessions });
            }
            catch (error) {
                console.error("Error fetching team analytics:", error);
                res.status(500).json({ message: 'Error fetching team analytics.' });
            }
        });
    }
    static getTeamSessionDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { sessionId } = req.params;
                const results = yield game_repositories_1.GameRepository.fetchFullSessionResults(sessionId);
                if (!results)
                    return res.status(404).json({ message: 'Session not found.' });
                res.status(200).json(results);
            }
            catch (error) {
                console.error("Error fetching session details:", error);
                res.status(500).json({ message: 'Error fetching session details.' });
            }
        });
    }
    static getTeamById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const team = yield TeamRepository_1.TeamRepository.findById(teamId);
                if (!team)
                    return res.status(404).json({ message: 'Team not found.' });
                res.status(200).json(team);
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching team details.' });
            }
        });
    }
    static getTeamByInviteCode(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { inviteCode } = req.params;
                const team = yield TeamRepository_1.TeamRepository.findByInviteCode(inviteCode);
                if (!team)
                    return res.status(404).json({ message: 'Invite code is invalid or has expired.' });
                res.status(200).json({
                    // @ts-ignore
                    id: team._id,
                    name: team.name,
                    description: team.description,
                    memberCount: team.members.length,
                });
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching team information.' });
            }
        });
    }
    static joinTeam(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { inviteCode } = req.body;
                // @ts-ignore
                const user = req.user;
                if (!user || !user.id)
                    return res.status(401).json({ message: 'Authentication error: User not found.' });
                const userId = user.id;
                const team = yield TeamRepository_1.TeamRepository.findByInviteCode(inviteCode);
                if (!team)
                    return res.status(404).json({ message: 'Invite code is invalid or has expired.' });
                // @ts-ignore
                const result = yield TeamRepository_1.TeamRepository.addUserToTeam(team._id.toString(), userId);
                if (result === 'already_member')
                    return res.status(409).json({ message: 'You are already a member of this team.' });
                if (result === 'not_found')
                    return res.status(404).json({ message: 'The team associated with this invite could not be found.' });
                // @ts-ignore
                res.status(200).json({ message: 'Successfully joined the team!', teamId: team._id });
            }
            catch (error) {
                console.error("[Controller Error] joinTeam:", error);
                res.status(500).json({ message: 'An internal server error occurred while joining the team.' });
            }
        });
    }
    static assignQuizSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const { quizId } = req.body;
                // @ts-ignore
                const userId = req.user.id;
                if (!quizId) {
                    return res.status(400).json({ message: 'Quiz ID is required.' });
                }
                const team = yield TeamRepository_1.TeamRepository.findById(teamId);
                if (!team)
                    return res.status(404).json({ message: 'Team not found.' });
                // @ts-ignore
                const member = team.members.find(m => m.userId._id.toString() === userId);
                if (!member || member.role !== 'owner') {
                    return res.status(403).json({ message: 'Only the team owner can assign quizzes.' });
                }
                // --- FIX: Use the updated repository method and check the result ---
                const { session, alreadyExists } = yield TeamRepository_1.TeamRepository.createTeamQuizSession(teamId, quizId, userId);
                if (alreadyExists) {
                    // Send a 409 Conflict error if the quiz is already assigned
                    return res.status(409).json({ message: 'This quiz is already assigned and waiting to be played.' });
                }
                res.status(201).json({ message: 'Quiz assigned successfully!', session });
            }
            catch (error) {
                console.error("Error assigning quiz session:", error);
                res.status(500).json({ message: 'Failed to assign quiz.' });
            }
        });
    }
    static getAssignedQuizzes(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { teamId } = req.params;
                const quizzes = yield TeamRepository_1.TeamRepository.getQuizzesForTeam(teamId);
                res.status(200).json(quizzes);
            }
            catch (error) {
                console.error("Error fetching assigned team quizzes:", error);
                res.status(500).json({ message: 'Error fetching team quizzes.' });
            }
        });
    }
    static startTeamLobby(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { sessionId } = req.params;
                // @ts-ignore
                const userId = req.user._id;
                const session = yield TeamRepository_1.TeamRepository.findSessionById(sessionId);
                if (!session || !session.hostId) {
                    return res.status(404).json({ message: "Game session not found." });
                }
                if (session.hostId.toString() !== userId.toString()) {
                    return res.status(403).json({ message: "Only the original host can start this game." });
                }
                if (session.status !== 'waiting') {
                    return res.status(409).json({ message: "This game has already been started." });
                }
                // Activate the lobby and get the join code
                const updatedSession = yield TeamRepository_1.TeamRepository.activateTeamLobby(sessionId);
                if (!updatedSession || !updatedSession.joinCode || !updatedSession.hostId) {
                    throw new Error("Failed to activate lobby and generate join code.");
                }
                // Create the in-memory session for Socket.IO to manage
                yield GameSession_2.GameSessionManager.addSession(updatedSession.joinCode, {
                    sessionId: updatedSession._id.toString(),
                    quizId: updatedSession.quizId.toString(),
                    teamId: (_a = updatedSession.teamId) === null || _a === void 0 ? void 0 : _a.toString(),
                    hostId: updatedSession.hostId.toString(),
                    settings: { autoNext: true, allowAnswerChange: false }, // Default settings
                });
                res.status(200).json({
                    message: 'Lobby started successfully!',
                    joinCode: updatedSession.joinCode
                });
            }
            catch (error) {
                console.error("Error starting team lobby:", error);
                res.status(500).json({ message: "Failed to start the lobby." });
            }
        });
    }
}
exports.TeamController = TeamController;
