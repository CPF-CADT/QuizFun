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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRepository = void 0;
const mongoose_1 = require("mongoose");
const Team_1 = require("../model/Team");
const TeamQuiz_1 = require("../model/TeamQuiz");
const GameSession_1 = require("../model/GameSession");
const crypto_1 = __importDefault(require("crypto"));
const generateRandomNumber_1 = require("../service/generateRandomNumber");
const Quiz_1 = require("../model/Quiz");
class TeamRepository {
    static getAggregatedQuizResultsForTeam(teamId, quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(teamId) || !mongoose_1.Types.ObjectId.isValid(quizId)) {
                return null;
            }
            const quiz = yield Quiz_1.QuizModel.findById(quizId).select('title').lean();
            if (!quiz)
                return null;
            const results = yield GameSession_1.GameSessionModel.aggregate([
                // 1. Find all completed sessions for this specific quiz and team
                {
                    $match: {
                        teamId: new mongoose_1.Types.ObjectId(teamId),
                        quizId: new mongoose_1.Types.ObjectId(quizId),
                        status: 'completed'
                    }
                },
                // 2. Unwind the results array to process each participant individually
                { $unwind: "$results" },
                // 3. Sort by score descending so we can easily find the best score for each player
                { $sort: { "results.finalScore": -1 } },
                // 4. Group by player to get their highest score
                {
                    $group: {
                        _id: "$results.userId",
                        name: { $first: "$results.nickname" },
                        highestScore: { $first: "$results.finalScore" },
                        // Capture the sessionId of their best attempt for the "Details" button
                        bestSessionId: { $first: "$_id" }
                    }
                },
                // 5. Sort the final list of players by their best score
                { $sort: { highestScore: -1 } },
                // 6. Look up user details for profile pictures
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                // 7. Project the final shape
                {
                    $project: {
                        _id: 0,
                        userId: "$_id",
                        name: { $ifNull: [{ $first: "$userDetails.name" }, "$name"] },
                        profileUrl: { $ifNull: [{ $first: "$userDetails.profileUrl" }, null] },
                        score: "$highestScore",
                        sessionId: "$bestSessionId"
                    }
                }
            ]);
            return {
                quizTitle: quiz.title,
                participants: results
            };
        });
    }
    static getOverallTeamLeaderboard(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!mongoose_1.Types.ObjectId.isValid(teamId))
                return [];
            const team = yield Team_1.TeamModel.findById(teamId).lean();
            if (!team)
                return [];
            const ownerId = (_a = team.members.find(m => m.role === 'owner')) === null || _a === void 0 ? void 0 : _a.userId;
            return GameSession_1.GameSessionModel.aggregate([
                // Step 1: Filter sessions for the specific team that are completed
                { $match: { teamId: new mongoose_1.Types.ObjectId(teamId), status: 'completed' } },
                // Step 2: Unwind the results array to process each participant
                { $unwind: "$results" },
                // Step 3: Exclude the owner from the results
                { $match: { "results.userId": { $ne: ownerId } } },
                // Step 4: Group by userId to sum up scores and count quizzes
                {
                    $group: {
                        _id: "$results.userId",
                        totalScore: { $sum: "$results.finalScore" },
                        quizzesPlayed: { $sum: 1 }
                    }
                },
                // Step 5: Sort by the total score
                { $sort: { totalScore: -1 } },
                // Step 6: Lookup user details to get name and profileUrl
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                { $unwind: "$userDetails" },
                // Step 7: Project the final shape
                {
                    $project: {
                        _id: 0,
                        userId: "$userDetails._id",
                        name: "$userDetails.name",
                        profileUrl: "$userDetails.profileUrl",
                        totalScore: "$totalScore",
                        quizzesPlayed: "$quizzesPlayed"
                    }
                }
            ]);
        });
    }
    static getCompletedSessionsForTeam(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(teamId))
                return [];
            return GameSession_1.GameSessionModel.find({ teamId: new mongoose_1.Types.ObjectId(teamId), status: 'completed' })
                .populate('quizId', 'title')
                .select('_id quizId endedAt results')
                .sort({ endedAt: -1 })
                .lean();
        });
    }
    /**
     * ✅ NEW: Gets detailed results for a single session, populating all necessary data.
     */
    static getSessionResults(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!mongoose_1.Types.ObjectId.isValid(sessionId))
                return null;
            const session = yield GameSession_1.GameSessionModel.findById(sessionId)
                .populate({
                path: 'results.userId',
                select: 'name profileUrl'
            })
                .populate('quizId', 'title')
                .lean();
            if (!session)
                return null;
            const participants = session.results
                .sort((a, b) => (a.finalRank || 999) - (b.finalRank || 999))
                .map(p => {
                var _a, _b, _c;
                return ({
                    // @ts-ignore
                    userId: (_a = p.userId) === null || _a === void 0 ? void 0 : _a._id,
                    // @ts-ignore
                    name: ((_b = p.userId) === null || _b === void 0 ? void 0 : _b.name) || p.nickname,
                    // @ts-ignore
                    profileUrl: (_c = p.userId) === null || _c === void 0 ? void 0 : _c.profileUrl,
                    score: p.finalScore,
                    rank: p.finalRank
                });
            });
            return {
                // @ts-ignore
                quizTitle: (_a = session.quizId) === null || _a === void 0 ? void 0 : _a.title,
                endedAt: session.endedAt,
                participants
            };
        });
    }
    /**
     * Creates a new team and adds the creator as the owner.
     */
    static createTeam(name, description, creatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const inviteCode = crypto_1.default.randomBytes(4).toString('hex');
            const team = yield Team_1.TeamModel.create({
                name,
                description,
                createdBy: new mongoose_1.Types.ObjectId(creatorId),
                inviteCode,
                members: [{ userId: new mongoose_1.Types.ObjectId(creatorId), role: 'owner' }]
            });
            return team;
        });
    }
    /**
     * Finds a team by its ID and populates member details.
     */
    static findById(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(teamId)) {
                console.warn(`Attempted to find team with invalid ID: ${teamId}`);
                return null;
            }
            return Team_1.TeamModel.findById(teamId).populate('members.userId', 'name profileUrl').lean();
        });
    }
    /**
     * Finds all teams a specific user is a member of.
     */
    static findTeamsByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return Team_1.TeamModel.find({ 'members.userId': new mongoose_1.Types.ObjectId(userId) }).lean();
        });
    }
    /**
     * Adds a quiz to a team's collection, specifying its mode.
     */
    static addQuizToTeam(teamId, quizId, userId, mode) {
        return __awaiter(this, void 0, void 0, function* () {
            const existing = yield TeamQuiz_1.TeamQuizModel.findOne({ teamId, quizId });
            if (existing) {
                return false;
            }
            yield TeamQuiz_1.TeamQuizModel.create({
                teamId: new mongoose_1.Types.ObjectId(teamId),
                quizId: new mongoose_1.Types.ObjectId(quizId),
                addedBy: new mongoose_1.Types.ObjectId(userId),
                mode: mode
            });
            return true;
        });
    }
    /**
     * Retrieves all quizzes associated with a specific team.
     */
    static getQuizzesForTeam(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return TeamQuiz_1.TeamQuizModel.find({ teamId: new mongoose_1.Types.ObjectId(teamId) })
                .populate({
                path: 'quizId',
                model: 'Quiz',
                select: 'title description questions'
            })
                .lean();
        });
    }
    /**
     * Retrieves all completed game sessions for a specific team.
     */
    static getSessionsForTeam(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return GameSession_1.GameSessionModel.find({ teamId: new mongoose_1.Types.ObjectId(teamId), status: 'completed' })
                .populate('quizId', 'title')
                .sort({ endedAt: -1 })
                .lean();
        });
    }
    static isUserMemberOfTeam(teamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(teamId) || !mongoose_1.Types.ObjectId.isValid(userId)) {
                return false;
            }
            // Counts documents matching both teamId and the userId within the members array.
            const count = yield Team_1.TeamModel.countDocuments({
                _id: new mongoose_1.Types.ObjectId(teamId),
                'members.userId': new mongoose_1.Types.ObjectId(userId)
            });
            // If count is greater than 0, the user is a member.
            return count > 0;
        });
    }
    static findByInviteCode(inviteCode) {
        return __awaiter(this, void 0, void 0, function* () {
            return Team_1.TeamModel.findOne({ inviteCode }).lean();
        });
    }
    static addUserToTeam(teamId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use a try-catch block for database operations that might fail
            try {
                const team = yield Team_1.TeamModel.findById(teamId);
                if (!team) {
                    return 'not_found';
                }
                // Safer check to prevent crashes if member.userId is somehow null
                const isAlreadyMember = team.members.some(member => member.userId && member.userId.equals(userId));
                if (isAlreadyMember) {
                    return 'already_member';
                }
                team.members.push({ userId: new mongoose_1.Types.ObjectId(userId), role: 'member' });
                yield team.save();
                return 'success';
            }
            catch (error) {
                console.error("Error in addUserToTeam:", error);
                throw error; // Re-throw the error to be caught by the controller
            }
        });
    }
    static createTeamQuizSession(teamId, quizId, hostId) {
        return __awaiter(this, void 0, void 0, function* () {
            // --- FIX: Check if a session for this quiz is already waiting for this team ---
            const existingSession = yield GameSession_1.GameSessionModel.findOne({
                teamId: new mongoose_1.Types.ObjectId(teamId),
                quizId: new mongoose_1.Types.ObjectId(quizId),
                status: 'waiting'
            });
            if (existingSession) {
                // If a session already exists, return it and flag that it's a duplicate
                return { session: existingSession, alreadyExists: true };
            }
            // If no waiting session exists, create a new one
            const session = new GameSession_1.GameSessionModel({
                quizId: new mongoose_1.Types.ObjectId(quizId),
                teamId: new mongoose_1.Types.ObjectId(teamId),
                hostId: new mongoose_1.Types.ObjectId(hostId),
                status: 'waiting',
                mode: 'multiplayer',
            });
            yield session.save();
            return { session, alreadyExists: false };
        });
    }
    /**
     * NEW: Fetches all 'waiting' sessions for a team. These are the playable quizzes.
     */
    static getWaitingSessionsForTeam(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            return GameSession_1.GameSessionModel.find({
                teamId: new mongoose_1.Types.ObjectId(teamId),
                status: 'waiting'
            })
                .populate('quizId', 'title description questions')
                .sort({ createdAt: -1 })
                .lean();
        });
    }
    static activateTeamLobby(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const joinCode = (0, generateRandomNumber_1.generateRandomNumber)(6);
            return GameSession_1.GameSessionModel.findByIdAndUpdate(sessionId, {
                $set: {
                    joinCode: joinCode,
                    status: 'waiting' // Keep as 'waiting' to signify lobby state
                }
            }, { new: true } // Return the updated document
            ).lean();
        });
    }
    static findSessionById(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(sessionId))
                return null;
            return GameSession_1.GameSessionModel.findById(sessionId).lean();
        });
    }
    static getAllAssignedQuizzesWithActiveSessions(teamId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Get all quizzes assigned to the team
            const assignedQuizzes = yield TeamQuiz_1.TeamQuizModel.find({ teamId: new mongoose_1.Types.ObjectId(teamId) })
                .populate({
                path: 'quizId',
                select: 'title description questions',
            })
                .lean();
            // 2. Find all active multiplayer sessions for this team
            const activeSessions = yield GameSession_1.GameSessionModel.find({
                teamId: new mongoose_1.Types.ObjectId(teamId),
                mode: 'multiplayer',
                status: { $in: ['waiting', 'in_progress'] } // Lobby is open or game is playing
            }).lean();
            // 3. Create a map for quick lookups
            const sessionMap = new Map(activeSessions.map(s => [s.quizId.toString(), s]));
            // 4. Combine the data
            return assignedQuizzes.map(assignedQuiz => {
                const quizDetails = assignedQuiz.quizId;
                const activeSession = sessionMap.get(quizDetails._id.toString());
                return {
                    _id: assignedQuiz._id, // The ID of the TeamQuiz assignment
                    quizId: quizDetails,
                    mode: assignedQuiz.mode,
                    hostId: activeSession === null || activeSession === void 0 ? void 0 : activeSession.hostId, // The host is only relevant if there's an active session
                    activeSession: activeSession ? {
                        sessionId: activeSession._id,
                        joinCode: activeSession.joinCode,
                        status: activeSession.status
                    } : null
                };
            });
        });
    }
}
exports.TeamRepository = TeamRepository;
