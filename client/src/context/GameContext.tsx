import {
    useState,
    useMemo,
    useCallback,
    useEffect,
    createContext,
    useContext,
    type ReactNode,
    useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { gameApi } from "../service/gameApi";

// --- TYPE DEFINITIONS ---
export type ParticipantRole = "host" | "player";
export type GameStateValue = "lobby" | "question" | "results" | "end" | "connecting";

export interface GameSettings {
    autoNext: boolean;
    allowAnswerChange: boolean;
}

export interface Participant {
    user_id: string;
    user_name: string;
    isOnline: boolean;
    score: number;
    role: ParticipantRole;
    hasAnswered: boolean;
}

export interface PlayerQuestion {
    questionText: string;
    point: number;
    timeLimit: number;
    imageUrl?: string;
    options: { text: string }[];
    correctAnswerIndex?: number;
    yourAnswer?: { optionIndex: number; wasCorrect: boolean };
}

export interface DetailedAnswer {
    _id: string;
    isUltimatelyCorrect: boolean;
    questionId: { questionText: string };
    attempts: { selectedOptionText?: string }[];
}

export interface FinalResultData {
    participantId?: string;
    name: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    percentage: number;
    averageTime: number;
    detailedAnswers?: DetailedAnswer[];
}

export interface ResultsPayload {
    viewType: "host" | "player" | "guest";
    results: FinalResultData[];
}

export interface GameState {
    sessionId: string | null;
    roomId: number | null;
    teamId?: string; // For team-based games
    gameState: GameStateValue;
    participants: Participant[];
    currentQuestionIndex: number;
    totalQuestions: number;
    question: PlayerQuestion | null;
    yourUserId: string | null;
    settings: GameSettings;
    answerCounts?: number[];
    questionStartTime?: number;
    error?: string;
    finalResults: ResultsPayload | null;
}

// --- CONSTANTS & INITIAL STATE ---
const SERVER_URL = import.meta.env.VITE_SOCKET_URL;
const initialState: GameState = {
    sessionId: null,
    roomId: null,
    teamId: undefined,
    gameState: "connecting",
    participants: [],
    currentQuestionIndex: -1,
    totalQuestions: 0,
    question: null,
    yourUserId: null,
    settings: { autoNext: true, allowAnswerChange: true },
    error: undefined,
    finalResults: null,
};

const GameContext = createContext<any>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
    const socketRef = useRef<Socket | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null); // Add socket state
    const [gameState, setGameState] = useState<GameState>(initialState);
    const [lastAnnouncedRoom, setLastAnnouncedRoom] = useState<number | null>(null);
    const navigate = useNavigate();

    // This main useEffect handles the socket connection and core listeners.
    useEffect(() => {
        if (socketRef.current) return;

        console.log("🔌 Initializing socket connection to:", SERVER_URL);
        const newSocket = io(SERVER_URL, { autoConnect: true, reconnection: true });
        socketRef.current = newSocket;
        setSocket(newSocket); // Set socket state immediately

        newSocket.on("connect", () => {
            console.log("🔌 Socket connected:", newSocket.id);
            setSocket(newSocket); // Update socket state when connected
            const storedRoomId = sessionStorage.getItem("quizRoomId");
            const storedUserId = sessionStorage.getItem("quizUserId");
            if (storedRoomId && storedUserId) {
                newSocket.emit("join-room", {
                    roomId: parseInt(storedRoomId),
                    userId: storedUserId,
                });
            }
        });

        newSocket.on("disconnect", () => {
            console.log("🔌 Socket disconnected");
            setSocket(null); // Clear socket state when disconnected
        });

        // This is the single, most important listener. It handles all state updates from the server.
        newSocket.on("game-update", (newState: Partial<GameState>) => {
            console.log("Received game-update. New gameState:", newState.gameState);
            setGameState((prev) => ({ ...prev, ...newState, error: undefined }));
            // Persist session info to handle refreshes and re-connections
            if (newState.sessionId) sessionStorage.setItem("quizSessionId", newState.sessionId);
            if (newState.roomId) sessionStorage.setItem("quizRoomId", newState.roomId.toString());
            if (newState.yourUserId) sessionStorage.setItem("quizUserId", newState.yourUserId);
        });

        newSocket.on("error-message", (errorMsg: string) => {
            console.error("Received error from server:", errorMsg);
            alert(errorMsg);
        });

        // Cleanup on component unmount
        return () => {
            console.log("🔌 Cleaning up socket connection");
            newSocket.disconnect();
            socketRef.current = null;
            setSocket(null);
        };
    }, []); // Empty dependency array ensures this runs only once.

    // This useEffect handles automatic navigation when a new game session starts.
    useEffect(() => {
        if (gameState.sessionId && !window.location.pathname.startsWith(`/game/`)) {
            console.log(`New session detected (${gameState.sessionId}), navigating to game page.`);
            navigate(`/game/${gameState.sessionId}`);
        }
    }, [gameState.sessionId, navigate]);

    // ✅ This useEffect announces the team lobby to teammates after it's created.
    useEffect(() => {
        const amIHost = gameState.participants.find(p => p.user_id === gameState.yourUserId)?.role === 'host';
        // If this is a team game, and we are the host, and we haven't announced this room yet...
        if (gameState.teamId && gameState.roomId && amIHost && gameState.roomId !== lastAnnouncedRoom) {
            console.log(`Announcing new team lobby for room ${gameState.roomId} to team ${gameState.teamId}`);
            // Tell the server to broadcast this lobby to our teammates.
            socketRef.current?.emit('host-activated-lobby', {
                teamId: gameState.teamId,
                roomId: gameState.roomId,
                sessionId: gameState.sessionId
            });
            // Remember that we announced this room so we don't do it again on re-renders.
            setLastAnnouncedRoom(gameState.roomId);
        }
    }, [gameState.teamId, gameState.roomId, gameState.participants, gameState.yourUserId, gameState.sessionId, lastAnnouncedRoom]);

    // ✅ This function now correctly handles creating both public and team games.
    const createRoom = useCallback((data: { quizId: string, userId: string, hostName: string, settings: GameSettings, teamId?: string }) => {
        // Reset state to clear any old game data and store the new teamId locally
        setGameState({ ...initialState, teamId: data.teamId });
        setLastAnnouncedRoom(null); // Reset the announcer state for the new room
        socketRef.current?.emit("create-room", data);
    }, []);

    // --- OTHER ACTION HANDLERS ---
    const joinRoom = useCallback((data: any) => socketRef.current?.emit("join-room", data), []);
    const startGame = useCallback((roomId: number) => socketRef.current?.emit("start-game", roomId), []);
    const submitAnswer = useCallback((data: any) => socketRef.current?.emit("submit-answer", data), []);
    const requestNextQuestion = useCallback((roomId: number | null) => {
        if (roomId) socketRef.current?.emit("request-next-question", roomId);
    }, []);
    const endGame = useCallback(() => {
        if (gameState.roomId) socketRef.current?.emit("end-game", gameState.roomId);
        sessionStorage.clear();
        setGameState(initialState);
        navigate("/dashboard");
    }, [gameState.roomId, navigate]);
    const updateSettings = useCallback((newSettings: GameSettings) => {
        if (gameState.roomId) {
            socketRef.current?.emit("update-settings", { roomId: gameState.roomId, settings: newSettings });
        }
    }, [gameState.roomId]);
    const fetchFinalResults = useCallback(async (sessionId: string | null) => {
        if (!sessionId) return alert("Session ID is missing.");
        const userId = sessionStorage.getItem("quizUserId");
        const guestName = sessionStorage.getItem("quizUserName");
        if (!userId && !guestName) return alert("User or Guest identifier is missing.");
        
        try {
            const response = await gameApi.getSessionResults(sessionId, {
                userId: userId || undefined,
                guestName: guestName || undefined,
            });
            setGameState((prev) => ({ ...prev, finalResults: response.data }));
        } catch (error) {
            console.error("Failed to fetch final results:", error);
            alert("Could not load game results.");
        }
    }, []);
    
    const joinTeamRoom = useCallback((teamId: string) => {
        console.log("🏠 joinTeamRoom called with teamId:", teamId);
        console.log("🏠 socketRef.current:", socketRef.current);
        console.log("🏠 socket connected:", socketRef.current?.connected);
        
        if (socketRef.current?.connected) {
            console.log("🏠 Emitting join-team-room event");
            socketRef.current.emit("join-team-room", teamId);
        } else {
            console.log("🏠 Socket not connected, cannot join team room");
        }
    }, []);
    
    const leaveTeamRoom = useCallback((teamId: string) => {
        console.log("🚪 leaveTeamRoom called with teamId:", teamId);
        socketRef.current?.emit("leave-team-room", teamId);
    }, []);

    const value = useMemo(() => ({
        gameState,
        socket: socket, // Use socket state instead of socketRef.current
        createRoom,
        joinRoom,
        startGame,
        submitAnswer,
        requestNextQuestion,
        endGame,
        fetchFinalResults,
        updateSettings,
        joinTeamRoom,
        leaveTeamRoom,
    }), [
        gameState,
        socket, // Add socket to dependencies
        createRoom, joinRoom, startGame, submitAnswer, requestNextQuestion, 
        endGame, fetchFinalResults, updateSettings, joinTeamRoom, leaveTeamRoom
    ]);

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useQuizGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useQuizGame must be used within a GameProvider");
    return context;
};