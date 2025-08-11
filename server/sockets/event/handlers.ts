import { Server, Socket } from "socket.io";
import { GameSessionManager, Participant, GameState } from "../../config/data/GameSession";
import { generateRandomNumber } from '../../service/generateRandomNumber';
import { QuizModel } from "../../model/Quiz";

// =================================================================================
// Type Definitions
// =================================================================================

export interface IQuestion {
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: {
        text: string;
        isCorrect: boolean;
    }[];
}

interface PlayerQuestion {
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: { text: string }[];
    correctAnswerIndex?: number;
    yourAnswer?: {
        optionIndex: number;
        wasCorrect: boolean;
    };
}

// =================================================================================
// Core Game Flow & State Broadcasting
// =================================================================================

function broadcastGameState(io: Server, roomId: number, errorMessage?: string) {
    const room = GameSessionManager.getSession(roomId);
    if (!room) return;

    const baseState = {
        roomId: roomId,
        gameState: room.gameState,
        participants: room.participants,
        currentQuestionIndex: room.currentQuestionIndex,
        totalQuestions: room.questions?.length || 0,
        error: errorMessage,
    };

    room.participants.forEach(p => {
        let questionPayload: IQuestion | PlayerQuestion | null = null;
        
        if (room.questions && room.gameState !== 'end' && room.currentQuestionIndex >= 0) {
            const currentQuestion = room.questions[room.currentQuestionIndex];
            
            if (p.role === 'host') {
                if (room.gameState === 'results') {
                    questionPayload = currentQuestion;
                } else {
                    questionPayload = { ...currentQuestion, options: currentQuestion.options.map(opt => ({ text: opt.text })) };
                }
            } else {
                const sanitizedQuestion: PlayerQuestion = {
                    questionText: currentQuestion.questionText,
                    point: currentQuestion.point,
                    timeLimit: currentQuestion.timeLimit,
                    imageUrl: currentQuestion.imageUrl,
                    options: currentQuestion.options.map(opt => ({ text: opt.text })),
                };
                
                if (room.gameState === 'results') {
                    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);
                    sanitizedQuestion.correctAnswerIndex = correctAnswerIndex;
                    
                    const playerAnswerIndex = room.answers.get(p.socket_id);
                    if (playerAnswerIndex !== undefined) {
                        sanitizedQuestion.yourAnswer = {
                            optionIndex: playerAnswerIndex,
                            wasCorrect: playerAnswerIndex === correctAnswerIndex,
                        };
                    }
                }
                questionPayload = sanitizedQuestion;
            }
        }

        const stateToSend = {
            ...baseState,
            question: questionPayload,
            yourSocketId: p.socket_id,
        };
        io.to(p.socket_id).emit('game-update', stateToSend);
    });

    if (room.gameState === 'question' && !room.questionTimer && room.questions) {
        const timeLimit = room.questions[room.currentQuestionIndex].timeLimit;
        room.questionTimer = setTimeout(() => endRound(io, roomId), timeLimit * 1000);
    }
}

function endRound(io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (!room || room.gameState !== 'question' || !room.questions) return;

    if (room.questionTimer) {
        clearTimeout(room.questionTimer);
        room.questionTimer = undefined;
    }

    console.log(`[Game] Round over for room ${roomId}.`);
    const currentQuestion = room.questions[room.currentQuestionIndex];
    const correctAnswerIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

    room.participants.forEach(p => {
        if (p.role === 'player') {
            const playerAnswer = room.answers.get(p.socket_id);
            if (playerAnswer !== undefined && playerAnswer === correctAnswerIndex) {
                p.score += currentQuestion.point;
            }
        }
    });

    room.gameState = 'results';
    broadcastGameState(io, roomId);
}

function nextQuestion(io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (!room || !room.questions) return;

    room.currentQuestionIndex++;
    room.answers.clear();
    room.participants.forEach(p => p.answered = false);

    if (room.currentQuestionIndex >= room.questions.length) {
        console.log(`[Game] Game over for room ${roomId}.`);
        room.gameState = 'end';
        broadcastGameState(io, roomId);
        return;
    }

    room.gameState = 'question';
    console.log(`[Game] Sending question ${room.currentQuestionIndex + 1} to room ${roomId}.`);
    broadcastGameState(io, roomId);
}

// =================================================================================
// Exported Socket Event Handlers
// =================================================================================

export function handleCreateRoom(socket: Socket, io: Server, data: { quizId: string, hostId: string, hostName: string }) {
    const roomId = generateRandomNumber(6);
    GameSessionManager.addSession(roomId, {
        quizId: data.quizId,
        hostId: data.hostId,
        host_socket_id: socket.id,
    });

    const room = GameSessionManager.getSession(roomId)!;
    const hostParticipant: Participant = {
        socket_id: socket.id,
        user_id: data.hostId,
        user_name: data.hostName,
        isOnline: true,
        score: 0,
        role: 'host',
        answered: false,
    };
    room.participants.push(hostParticipant);
    socket.join(roomId.toString());

    console.log(`User ${socket.id} (Host: ${data.hostName}) created room: ${roomId}`);
    broadcastGameState(io, roomId);
}

export function handleJoinRoom(socket: Socket, io: Server, data: { roomId: number; username: string, user_id: string }) {
    const { roomId, username, user_id } = data;
    const room = GameSessionManager.getSession(roomId);

    if (!room) return socket.emit("error-message", `Room "${roomId}" does not exist.`);
    if (room.gameState !== 'lobby') return socket.emit("error-message", `Game in room "${roomId}" has already started.`);
    if (room.participants.length >= 20) return socket.emit("error-message", `Room "${roomId}" is full.`);

    const player: Participant = {
        socket_id: socket.id,
        user_id: user_id,
        user_name: username,
        isOnline: true,
        score: 0,
        role: 'player',
        answered: false,
    };
    room.participants.push(player);
    socket.join(roomId.toString());

    console.log(`User ${socket.id} (${username}) joined room: ${roomId}`);
    broadcastGameState(io, roomId);
}

export async function startGame(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);

    if (!room || room.host_socket_id !== socket.id) return socket.emit("error-message", "Only the host can start the game.");
    if (room.participants.filter(p => p.role === 'player').length === 0) return socket.emit("error-message", "Cannot start with no players.");

    try {
        const quiz = await QuizModel.findById(room.quizId).lean();
        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
            return broadcastGameState(io, roomId, "This quiz has no questions.");
        }
        room.questions = quiz.questions;
        room.gameState = 'question';
        room.currentQuestionIndex = 0;

        console.log(`[Game] Game starting in room ${roomId}.`);
        broadcastGameState(io, roomId);
    } catch (error) {
        console.error(`Error starting game for room ${roomId}:`, error);
        broadcastGameState(io, roomId, "A server error occurred while starting the game.");
    }
}

export function handleSubmitAnswer(socket: Socket, io: Server, data: { roomId: number; optionIndex: number }) {
    const { roomId, optionIndex } = data;
    const room = GameSessionManager.getSession(roomId);
    const player = room?.participants.find(p => p.socket_id === socket.id);

    if (!room || !player || player.role !== 'player' || room.gameState !== 'question') return;

    if (!player.answered) {
        player.answered = true;
        room.answers.set(socket.id, optionIndex);
        console.log(`[Game] Player ${socket.id} in room ${roomId} answered.`);

        const activePlayers = room.participants.filter(p => p.role === 'player' && p.isOnline);
        if (activePlayers.every(p => p.answered)) {
            endRound(io, roomId);
        } else {
            broadcastGameState(io, roomId);
        }
    }
}

export function handleRequestNextQuestion(socket: Socket, io: Server, roomId: number) {
    const room = GameSessionManager.getSession(roomId);
    if (room && room.host_socket_id === socket.id && room.gameState === 'results') {
        nextQuestion(io, roomId);
    }
}

export function handleRejoinGame(socket: Socket, io: Server, data: { roomId: number, oldSocketId: string }) {
    const { roomId, oldSocketId } = data;
    const room = GameSessionManager.getSession(roomId);
    if (!room) return socket.emit('error-message', 'The game you tried to join does not exist.');

    const participant = room.participants.find(p => p.socket_id === oldSocketId);
    if (participant) {
        console.log(`Participant ${participant.user_name} rejoining room ${roomId}.`);
        participant.socket_id = socket.id;
        participant.isOnline = true;
        
        if (participant.role === 'host') {
            room.host_socket_id = socket.id;
        }

        socket.join(roomId.toString());
        broadcastGameState(io, roomId);
    } else {
        socket.emit('error-message', 'Could not find your session in this game.');
    }
}

export function handleDisconnect(socket: Socket, io: Server) {
    const sessionInfo = GameSessionManager.getSessionBySocketId(socket.id);
    if (sessionInfo) {
        const { roomId, session } = sessionInfo;
        const disconnectedUser = session.participants.find(p => p.socket_id === socket.id);

        if (disconnectedUser) {
            console.log(`User ${disconnectedUser.user_name} disconnected from room ${roomId}.`);
            disconnectedUser.isOnline = false;

            if (disconnectedUser.role === 'host') {
                console.log(`Host disconnected. Starting 5-second grace period for room ${roomId}.`);
                broadcastGameState(io, roomId, "The host has disconnected. Waiting for reconnection...");

                setTimeout(() => {
                    const currentRoom = GameSessionManager.getSession(roomId);
                    if (currentRoom) {
                        const host = currentRoom.participants.find(p => p.role === 'host');
                        if (host && !host.isOnline) {
                            console.log(`Host did not reconnect in time. Ending game in room ${roomId}.`);
                            broadcastGameState(io, roomId, "The host did not reconnect. The game has ended.");
                            GameSessionManager.removeSession(roomId);
                        } else {
                            console.log(`Host reconnected within the grace period for room ${roomId}.`);
                        }
                    }
                }, 5000); 
            } else {
                broadcastGameState(io, roomId);
            }
        }
    }
}
