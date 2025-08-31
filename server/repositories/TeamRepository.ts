import { Types } from 'mongoose';
import { TeamModel, ITeam, ITeamMember } from '../model/Team';
import { TeamQuizModel } from '../model/TeamQuiz';
import { GameSessionModel } from '../model/GameSession';
import crypto from 'crypto';
import { generateRandomNumber } from '../service/generateRandomNumber';
import { QuizModel } from '../model/Quiz';

export class TeamRepository {
 static async getAggregatedQuizResultsForTeam(teamId: string, quizId: string) {
        if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(quizId)) {
            return null;
        }

        const quiz = await QuizModel.findById(quizId).select('title').lean();
        if (!quiz) return null;

        const results = await GameSessionModel.aggregate([
            // 1. Find all completed sessions for this specific quiz and team
            {
                $match: {
                    teamId: new Types.ObjectId(teamId),
                    quizId: new Types.ObjectId(quizId),
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
    }
   static async getOverallTeamLeaderboard(teamId: string) {
        if (!Types.ObjectId.isValid(teamId)) return [];

        const team = await TeamModel.findById(teamId).lean();
        if (!team) return [];
        
        const ownerId = team.members.find(m => m.role === 'owner')?.userId;

        return GameSessionModel.aggregate([
            // Step 1: Filter sessions for the specific team that are completed
            { $match: { teamId: new Types.ObjectId(teamId), status: 'completed' } },
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
    }


    static async getCompletedSessionsForTeam(teamId: string) {
        if (!Types.ObjectId.isValid(teamId)) return [];
        return GameSessionModel.find({ teamId: new Types.ObjectId(teamId), status: 'completed' })
            .populate('quizId', 'title')
            .select('_id quizId endedAt results')
            .sort({ endedAt: -1 })
            .lean();
    }
    
    /**
     * ✅ NEW: Gets detailed results for a single session, populating all necessary data.
     */
    static async getSessionResults(sessionId: string) {
        if (!Types.ObjectId.isValid(sessionId)) return null;

        const session = await GameSessionModel.findById(sessionId)
            .populate({
                path: 'results.userId',
                select: 'name profileUrl'
            })
            .populate('quizId', 'title')
            .lean();

        if (!session) return null;

        const participants = session.results
            .sort((a, b) => (a.finalRank || 999) - (b.finalRank || 999))
            .map(p => ({
                 // @ts-ignore
                userId: p.userId?._id,
                 // @ts-ignore
                name: p.userId?.name || p.nickname,
                 // @ts-ignore
                profileUrl: p.userId?.profileUrl,
                score: p.finalScore,
                rank: p.finalRank
            }));

        return {
            // @ts-ignore
            quizTitle: session.quizId?.title,
            endedAt: session.endedAt,
            participants
        };
    }

    /**
     * Creates a new team and adds the creator as the owner.
     */
    static async createTeam(name: string, description: string | undefined, creatorId: string): Promise<ITeam> {
        const inviteCode = crypto.randomBytes(4).toString('hex');
        const team = await TeamModel.create({
            name,
            description,
            createdBy: new Types.ObjectId(creatorId),
            inviteCode,
            members: [{ userId: new Types.ObjectId(creatorId), role: 'owner' }]
        });
        return team;
    }

    /**
     * Finds a team by its ID and populates member details.
     */
    static async findById(teamId: string): Promise<ITeam | null> {
        if (!Types.ObjectId.isValid(teamId)) {
            console.warn(`Attempted to find team with invalid ID: ${teamId}`);
            return null;
        }
        return TeamModel.findById(teamId).populate('members.userId', 'name profileUrl').lean();
    }

    /**
     * Finds all teams a specific user is a member of.
     */
    static async findTeamsByUserId(userId: string): Promise<ITeam[]> {
        return TeamModel.find({ 'members.userId': new Types.ObjectId(userId) }).lean();
    }

    /**
     * Adds a quiz to a team's collection, specifying its mode.
     */
    static async addQuizToTeam(teamId: string, quizId: string, userId: string, mode: 'solo' | 'multiplayer'): Promise<boolean> {
        const existing = await TeamQuizModel.findOne({ teamId, quizId });
        if (existing) {
            return false;
        }
        await TeamQuizModel.create({
            teamId: new Types.ObjectId(teamId),
            quizId: new Types.ObjectId(quizId),
            addedBy: new Types.ObjectId(userId),
            mode: mode
        });
        return true;
    }

    /**
     * Retrieves all quizzes associated with a specific team.
     */
    static async getQuizzesForTeam(teamId: string) {
        return TeamQuizModel.find({ teamId: new Types.ObjectId(teamId) })
            .populate({
                path: 'quizId',
                model: 'Quiz',
                select: 'title description questions'
            })
            .lean();
    }

    /**
     * Retrieves all completed game sessions for a specific team.
     */
    static async getSessionsForTeam(teamId: string) {
        return GameSessionModel.find({ teamId: new Types.ObjectId(teamId), status: 'completed' })
            .populate('quizId', 'title')
            .sort({ endedAt: -1 })
            .lean();
    }

    static async isUserMemberOfTeam(teamId: string, userId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(teamId) || !Types.ObjectId.isValid(userId)) {
            return false;
        }
        // Counts documents matching both teamId and the userId within the members array.
        const count = await TeamModel.countDocuments({
            _id: new Types.ObjectId(teamId),
            'members.userId': new Types.ObjectId(userId)
        });
        // If count is greater than 0, the user is a member.
        return count > 0;
    }

    static async findByInviteCode(inviteCode: string): Promise<ITeam | null> {
        return TeamModel.findOne({ inviteCode }).lean();
    }

    static async addUserToTeam(teamId: string, userId: string): Promise<'success' | 'already_member' | 'not_found'> {
        // Use a try-catch block for database operations that might fail
        try {
            const team = await TeamModel.findById(teamId);
            if (!team) {
                return 'not_found';
            }

            // Safer check to prevent crashes if member.userId is somehow null
            const isAlreadyMember = team.members.some(member => member.userId && member.userId.equals(userId));
            if (isAlreadyMember) {
                return 'already_member';
            }

            team.members.push({ userId: new Types.ObjectId(userId), role: 'member' } as ITeamMember);
            await team.save();
            return 'success';

        } catch (error) {
            console.error("Error in addUserToTeam:", error);
            throw error; // Re-throw the error to be caught by the controller
        }
    }
    static async createTeamQuizSession(teamId: string, quizId: string, hostId: string): Promise<{ session: any; alreadyExists: boolean }> {
        // --- FIX: Check if a session for this quiz is already waiting for this team ---
        const existingSession = await GameSessionModel.findOne({
            teamId: new Types.ObjectId(teamId),
            quizId: new Types.ObjectId(quizId),
            status: 'waiting'
        });

        if (existingSession) {
            // If a session already exists, return it and flag that it's a duplicate
            return { session: existingSession, alreadyExists: true };
        }

        // If no waiting session exists, create a new one
        const session = new GameSessionModel({
            quizId: new Types.ObjectId(quizId),
            teamId: new Types.ObjectId(teamId),
            hostId: new Types.ObjectId(hostId),
            status: 'waiting',
            mode: 'multiplayer',
        });
        await session.save();
        return { session, alreadyExists: false };
    }



    /**
     * NEW: Fetches all 'waiting' sessions for a team. These are the playable quizzes.
     */
    static async getWaitingSessionsForTeam(teamId: string) {
        return GameSessionModel.find({
            teamId: new Types.ObjectId(teamId),
            status: 'waiting'
        })
            .populate('quizId', 'title description questions')
            .sort({ createdAt: -1 })
            .lean();
    }

    static async activateTeamLobby(sessionId: string) {
        const joinCode = generateRandomNumber(6);
        return GameSessionModel.findByIdAndUpdate(
            sessionId,
            {
                $set: {
                    joinCode: joinCode,
                    status: 'waiting' // Keep as 'waiting' to signify lobby state
                }
            },
            { new: true } // Return the updated document
        ).lean();
    }
    static async findSessionById(sessionId: string) {
        if (!Types.ObjectId.isValid(sessionId)) return null;
        return GameSessionModel.findById(sessionId).lean();
    }
    static async getAllAssignedQuizzesWithActiveSessions(teamId: string) {
        // 1. Get all quizzes assigned to the team
        const assignedQuizzes = await TeamQuizModel.find({ teamId: new Types.ObjectId(teamId) })
            .populate({
                path: 'quizId',
                select: 'title description questions',
            })
            .lean();

        // 2. Find all active multiplayer sessions for this team
        const activeSessions = await GameSessionModel.find({
            teamId: new Types.ObjectId(teamId),
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
                hostId: activeSession?.hostId, // The host is only relevant if there's an active session
                activeSession: activeSession ? {
                    sessionId: activeSession._id,
                    joinCode: activeSession.joinCode,
                    status: activeSession.status
                } : null
            };
        });
    }
}
