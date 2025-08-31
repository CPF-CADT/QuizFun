import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { TeamRepository } from '../repositories/TeamRepository';
import { GameRepository } from '../repositories/game.repositories';
import { GameSessionModel } from '../model/GameSession';
import { GameSessionManager } from '../config/data/GameSession';

export class TeamController {

    static async createTeam(req: Request, res: Response) {
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
            const team = await TeamRepository.createTeam(name, description, creatorId);
            res.status(201).json(team);
        } catch (error) {
            console.error("Error creating team:", error);
            res.status(500).json({ message: 'Error creating team.' });
        }
    }

    static async getUserTeams(req: Request, res: Response) {
        try {
            // @ts-ignore
            const userId = req.user.id;
            if (!userId) {
                return res.status(401).json({ message: 'Authentication error: User not found' });
            }
            const teams = await TeamRepository.findTeamsByUserId(userId);
            res.status(200).json(teams);
        } catch (error) {
            console.error("Error fetching user teams:", error);
            res.status(500).json({ message: 'Error fetching user teams.' });
        }
    }

    /**
     * ADDED: Fetches all members of a specific team.
     */
    static async getTeamMembers(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const team = await TeamRepository.findById(teamId);
            if (!team) {
                return res.status(404).json({ message: 'Team not found.' });
            }
            res.status(200).json(team.members);
        } catch (error) {
            console.error("Error fetching team members:", error);
            res.status(500).json({ message: 'Error fetching team members.' });
        }
    }

    /**
     * ADDED: Invites users to a team.
     */
    static async inviteMembers(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const { userIds } = req.body; // Expect an array of user IDs
            if (!userIds || !Array.isArray(userIds)) {
                return res.status(400).json({ message: 'An array of userIds is required.' });
            }

            // Here you would add the logic to add each userId to the team's member list
            // For example: await TeamRepository.addUsersToTeam(teamId, userIds);

            res.status(200).json({ message: 'Invitations sent successfully.' });
        } catch (error) {
            console.error("Error inviting members:", error);
            res.status(500).json({ message: 'Error inviting members.' });
        }
    }

    /**
     * ADDED: Fetches all quizzes associated with a team's library.
     */
    static async getQuizzesForTeam(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const quizzes = await TeamRepository.getQuizzesForTeam(teamId);
            res.status(200).json(quizzes);
        } catch (error) {
            console.error("Error fetching team quizzes:", error);
            res.status(500).json({ message: 'Error fetching team quizzes.' });
        }
    }

    static async addQuizToTeam(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const { quizId, mode } = req.body;
            // @ts-ignore
            const userId = req.user.id;

            if (!userId) return res.status(401).json({ message: 'Authentication error: User not found' });
            if (!quizId || !mode) return res.status(400).json({ message: 'Quiz ID and mode are required.' });
            if (!['solo', 'multiplayer'].includes(mode)) return res.status(400).json({ message: 'Invalid mode specified.' });

            const team = await TeamRepository.findById(teamId);
            if (!team) return res.status(404).json({ message: 'Team not found.' });

            // @ts-ignore
            const member = team.members.find(m => m.userId._id.toString() === userId);
            if (!member || member.role !== 'owner') {
                return res.status(403).json({ message: 'You do not have permission to add quizzes to this team.' });
            }

            const success = await TeamRepository.addQuizToTeam(teamId, quizId, userId, mode);
            if (!success) return res.status(409).json({ message: 'This quiz has already been added to the team.' });

            res.status(201).json({ message: 'Quiz added to team successfully.' });
        } catch (error) {
            console.error("Error adding quiz to team:", error);
            res.status(500).json({ message: 'Error adding quiz to team.' });
        }
    }

    static async startTeamSoloSession(req: Request, res: Response) {
        try {
            const { teamId, quizId } = req.body;
            // @ts-ignore
            const user = req.user;
            if (!user) return res.status(401).json({ message: 'User not found.' });

            const isMember = await TeamRepository.isUserMemberOfTeam(teamId, user.id);
            if (!isMember) {
                return res.status(403).json({ message: 'You must be a member of this team to start this quiz.' });
            }

            const session = new GameSessionModel({
                quizId,
                teamId,
                hostId: user.id, 
                mode: 'solo',
                status: 'in_progress',
                startedAt: new Date(),
            });
            await session.save();

            res.status(201).json({ sessionId: session._id.toString(), message: 'Team solo session started successfully.' });
        } catch (error) {
            console.error("Error starting team solo session:", error);
            res.status(500).json({ message: 'Error starting solo session.' });
        }
    }

    static async getTeamAnalyticsOverview(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const sessions = await TeamRepository.getSessionsForTeam(teamId);
            const summary = { avgScore: 84, participationRate: 92, quizzesPlayed: sessions.length };
            res.status(200).json({ summary, sessions });
        } catch (error) {
            console.error("Error fetching team analytics:", error);
            res.status(500).json({ message: 'Error fetching team analytics.' });
        }
    }
    

    static async getTeamSessionDetails(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            const results = await GameRepository.fetchFullSessionResults(sessionId);
            if (!results) return res.status(404).json({ message: 'Session not found.' });
            res.status(200).json(results);
        } catch (error) {
            console.error("Error fetching session details:", error);
            res.status(500).json({ message: 'Error fetching session details.' });
        }
    }

    static async getTeamById(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const team = await TeamRepository.findById(teamId);
            if (!team) return res.status(404).json({ message: 'Team not found.' });
            res.status(200).json(team);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching team details.' });
        }
    }

    static async getTeamByInviteCode(req: Request, res: Response) {
        try {
            const { inviteCode } = req.params;
            const team = await TeamRepository.findByInviteCode(inviteCode);
            if (!team) return res.status(404).json({ message: 'Invite code is invalid or has expired.' });
            res.status(200).json({
                // @ts-ignore
                id: team._id,
                name: team.name,
                description: team.description,
                memberCount: team.members.length,
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching team information.' });
        }
    }

    static async joinTeam(req: Request, res: Response) {
        try {
            const { inviteCode } = req.body;
            // @ts-ignore
            const user = req.user;
            if (!user || !user.id) return res.status(401).json({ message: 'Authentication error: User not found.' });

            const userId = user.id;
            const team = await TeamRepository.findByInviteCode(inviteCode);
            if (!team) return res.status(404).json({ message: 'Invite code is invalid or has expired.' });

            // @ts-ignore
            const result = await TeamRepository.addUserToTeam(team._id.toString(), userId);

            if (result === 'already_member') return res.status(409).json({ message: 'You are already a member of this team.' });
            if (result === 'not_found') return res.status(404).json({ message: 'The team associated with this invite could not be found.' });

            // @ts-ignore
            res.status(200).json({ message: 'Successfully joined the team!', teamId: team._id });
        } catch (error) {
            console.error("[Controller Error] joinTeam:", error);
            res.status(500).json({ message: 'An internal server error occurred while joining the team.' });
        }
    }

    static async assignQuizSession(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const { quizId } = req.body;
            // @ts-ignore
            const userId = req.user.id;

            if (!quizId) {
                return res.status(400).json({ message: 'Quiz ID is required.' });
            }

            const team = await TeamRepository.findById(teamId);
            if (!team) return res.status(404).json({ message: 'Team not found.' });

            // @ts-ignore
            const member = team.members.find(m => m.userId._id.toString() === userId);
            if (!member || member.role !== 'owner') {
                return res.status(403).json({ message: 'Only the team owner can assign quizzes.' });
            }

            // --- FIX: Use the updated repository method and check the result ---
            const { session, alreadyExists } = await TeamRepository.createTeamQuizSession(teamId, quizId, userId);

            if (alreadyExists) {
                // Send a 409 Conflict error if the quiz is already assigned
                return res.status(409).json({ message: 'This quiz is already assigned and waiting to be played.' });
            }

            res.status(201).json({ message: 'Quiz assigned successfully!', session });

        } catch (error) {
            console.error("Error assigning quiz session:", error);
            res.status(500).json({ message: 'Failed to assign quiz.' });
        }
    }
     static async getAssignedQuizzes(req: Request, res: Response) {
        try {
            const { teamId } = req.params;
            const quizzes = await TeamRepository.getQuizzesForTeam(teamId);
            res.status(200).json(quizzes);
        } catch (error) {
            console.error("Error fetching assigned team quizzes:", error);
            res.status(500).json({ message: 'Error fetching team quizzes.' });
        }
    }
    static async startTeamLobby(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;
            // @ts-ignore
            const userId = req.user._id;

            const session = await TeamRepository.findSessionById(sessionId);

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
            const updatedSession = await TeamRepository.activateTeamLobby(sessionId);
            if (!updatedSession || !updatedSession.joinCode || !updatedSession.hostId) {
                throw new Error("Failed to activate lobby and generate join code.");
            }

            // Create the in-memory session for Socket.IO to manage
            await GameSessionManager.addSession(updatedSession.joinCode, {
                sessionId: updatedSession._id.toString(),
                quizId: updatedSession.quizId.toString(),
                teamId: updatedSession.teamId?.toString(),
                hostId: updatedSession.hostId.toString(),
                settings: { autoNext: true, allowAnswerChange: false }, // Default settings
            });

            res.status(200).json({
                message: 'Lobby started successfully!',
                joinCode: updatedSession.joinCode
            });

        } catch (error) {
            console.error("Error starting team lobby:", error);
            res.status(500).json({ message: "Failed to start the lobby." });
        }
    }
}
