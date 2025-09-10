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
    import Cookies from "js-cookie";
    import { gameApi, type ResultsPayload } from "../service/gameApi";
    import type { MusicTrack, SoundEffect } from "../components/game/SoundManager";

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
    export interface FinalResultData {
        participantId?: string;
        name: string;
        score: number;
        correctAnswers: number;
        totalQuestions: number;
        percentage: number;
        averageTime: number;
        detailedAnswers?: any[];
    }

    export interface GameState {
        sessionId: string | null;
        roomId: number | null;
        teamId?: string;
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
    interface reconnectSelectedOption {
        reconnect?: boolean;
        option: number;
        questionNo: number;
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
        answerCounts: [],
        questionStartTime: undefined,
    };

    const GameContext = createContext<any>(null);

    export const GameProvider = ({ children }: { children: ReactNode }) => {
        const socketRef = useRef<Socket | null>(null);
        const [gameState, setGameState] = useState<GameState>(initialState);
        const [userSeleted, setUserSeleted] = useState<reconnectSelectedOption | null>(null);
        const navigate = useNavigate();

        // State for managing audio
        const [sfxToPlay, setSfxToPlay] = useState<SoundEffect>(null);
        const [musicToPlay, setMusicToPlay] = useState<MusicTrack>(null);

        const fetchFinalResults = useCallback(async (sessionId: string | null) => {
            if (!sessionId) return;
            const userId = Cookies.get("quizUserId");
            const guestName = Cookies.get("quizUserName");
            if (!userId && !guestName) return;

            try {
                const response = await gameApi.getSessionResults(sessionId, {
                    userId: userId || undefined,
                    guestName: guestName || undefined,
                    view:'summary'
                });
                setGameState((prev) => ({ ...prev, finalResults: response.data }));
            } catch (error) {
                console.error("Failed to fetch final results:", error);
            }
        }, []);

        // --- EFFECT HOOKS ---
        useEffect(() => {
            if (socketRef.current) return;
            const newSocket = io(SERVER_URL, { autoConnect: true, reconnection: true });
            socketRef.current = newSocket;

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                const storedRoomId = Cookies.get("quizRoomId");
                const storedUserId = Cookies.get("quizUserId");
                if (storedRoomId && storedUserId) {
                    newSocket.emit("join-room", {
                        roomId: parseInt(storedRoomId),
                        userId: storedUserId,
                    });
                }
            });

            newSocket.on("game-update", (newState: Partial<GameState>) => {
                setGameState((prev) => ({ ...prev, ...newState, error: undefined }));
                if (newState.sessionId)
                    Cookies.set("quizSessionId", newState.sessionId, { expires: 1 });
                if (newState.roomId)
                    Cookies.set("quizRoomId", newState.roomId.toString(), { expires: 1 });
                if (newState.yourUserId)
                    Cookies.set("quizUserId", newState.yourUserId, { expires: 1 });
            });

            newSocket.on("your-selected", (data: reconnectSelectedOption) => {
                if (data.reconnect) {
                    setUserSeleted({
                        option: data.option,
                        questionNo: data.questionNo,
                        reconnect: data.reconnect,
                    });
                }
            });

            newSocket.on("error-message", (errorMsg: string) => {
                console.error("Server Error:", errorMsg);
                alert(errorMsg);
                Cookies.remove("quizSessionId");
                Cookies.remove("quizRoomId");
                Cookies.remove("quizUserId");
                Cookies.remove("quizUserName");
                setGameState(initialState);
            });

            return () => {
                newSocket.disconnect();
                socketRef.current = null;
            };
        }, []);

        useEffect(() => {
            if (gameState.sessionId && !window.location.pathname.startsWith(`/game/`)) {
                navigate(`/game/${gameState.sessionId}`);
            }
        }, [gameState.sessionId, navigate]);

        useEffect(() => {
            const myAnswer = gameState.question?.yourAnswer;
            switch (gameState.gameState) {
                case "lobby":
                    setMusicToPlay("lobby");
                    setSfxToPlay(null);
                    break;
                case "question":
                    setMusicToPlay("in-game");
                    setSfxToPlay("tick");
                    break;
                case "results":
                    setMusicToPlay(null);
                    if (myAnswer)
                        setSfxToPlay(myAnswer.wasCorrect ? "correct" : "incorrect");
                    else setSfxToPlay(null);
                    break;
                case "end":
                    setMusicToPlay("game-over");
                    setSfxToPlay(null);
                    break;
                default:
                    setMusicToPlay(null);
                    setSfxToPlay(null);
            }
        }, [gameState.gameState, gameState.question]);

        useEffect(() => {
            if (gameState.gameState === "end" && !gameState.finalResults) {
                fetchFinalResults(gameState.sessionId);
            }
        }, [
            gameState.gameState,
            gameState.sessionId,
            gameState.finalResults,
            fetchFinalResults,
        ]);

        // --- ACTION HANDLERS ---
        const createRoom = useCallback(
            (data: {
                quizId: string;
                userId: string;
                hostName: string;
                settings: GameSettings;
                teamId?: string;
            }) => {
                setGameState({ ...initialState, teamId: data.teamId });
                socketRef.current?.emit("create-room", data);
            },
            []
        );

        const joinRoom = useCallback((data: any) => socketRef.current?.emit("join-room", data), []);
        const startGame = useCallback(
            (roomId: number) => socketRef.current?.emit("start-game", roomId),
            []
        );

        const submitAnswer = useCallback((data: any) => {
            setSfxToPlay(null);
            socketRef.current?.emit("submit-answer", data);
        }, []);

        const requestNextQuestion = useCallback((roomId: number | null) => {
            setUserSeleted(null);
            if (roomId) socketRef.current?.emit("request-next-question", roomId);
        }, []);

        const endGame = useCallback(() => {
            if (gameState.roomId) socketRef.current?.emit("end-game", gameState.roomId);
            Cookies.remove("quizSessionId");
            Cookies.remove("quizRoomId");
            Cookies.remove("quizUserId");
            Cookies.remove("quizUserName");
            setGameState(initialState);
            navigate("/dashboard");
        }, [gameState.roomId, navigate]);

        const updateSettings = useCallback(
            (newSettings: GameSettings) => {
                if (gameState.roomId && socketRef.current) {
                    setGameState((prev) => ({ ...prev, settings: newSettings }));
                    socketRef.current.emit("update-settings", {
                        roomId: gameState.roomId,
                        settings: newSettings,
                    });
                }
            },
            [gameState.roomId]
        );

        const value = useMemo(
            () => ({
                gameState,
                sfxToPlay,
                musicToPlay,
                userSeleted,
                createRoom,
                joinRoom,
                startGame,
                submitAnswer,
                requestNextQuestion,
                endGame,
                fetchFinalResults,
                updateSettings,
                setUserSeleted,
            }),
            [
                gameState,
                sfxToPlay,
                musicToPlay,
                userSeleted,
                createRoom,
                joinRoom,
                startGame,
                submitAnswer,
                requestNextQuestion,
                endGame,
                fetchFinalResults,
                updateSettings,
            ]
        );

        return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
    };

    export const useQuizGame = () => {
        const context = useContext(GameContext);
        if (!context)
            throw new Error("useQuizGame must be used within a GameProvider");
        return context;
    };

    export type { ResultsPayload };
