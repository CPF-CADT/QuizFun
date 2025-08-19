import React, {
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

// --- TYPE DEFINITIONS (Comprehensive) ---
export type ParticipantRole = "host" | "player";
export type GameStateValue =
  | "lobby"
  | "question"
  | "results"
  | "end"
  | "connecting";
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
export interface QuestionOption {
  text: string;
}
export interface PlayerQuestion {
  questionText: string;
  point: number;
  timeLimit: number;
  imageUrl?: string;
  options: QuestionOption[];
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
const SERVER_URL = "http://localhost:3000";
const initialState: GameState = {
  sessionId: null,
  roomId: null,
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
  const navigate = useNavigate();

  // Effect for initializing and managing the socket connection
  useEffect(() => {
    // FIX: Initialize socket only ONCE and store it in a ref
    if (socketRef.current) return;

    const newSocket = io(SERVER_URL, { autoConnect: true, reconnection: true });
    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      const storedRoomId = sessionStorage.getItem("quizRoomId");
      const storedUserId = sessionStorage.getItem("quizUserId");
      if (storedRoomId && storedUserId) {
        newSocket.emit("rejoin-game", {
          roomId: parseInt(storedRoomId),
          userId: storedUserId,
        });
      }
    });

    newSocket.on("game-update", (newState: Partial<GameState>) => {
      console.log("Received game-update. New gameState:", newState.gameState);
      setGameState((prev) => ({ ...prev, ...newState, error: undefined })); // Persist session info for potential reconnections
      if (newState.sessionId)
        sessionStorage.setItem("quizSessionId", newState.sessionId);
      if (newState.roomId)
        sessionStorage.setItem("quizRoomId", newState.roomId.toString());
      if (newState.yourUserId)
        sessionStorage.setItem("quizUserId", newState.yourUserId);
    });

    newSocket.on("error-message", (message: string) => {
      console.error(`Received error: ${message}`);
      alert(`Error: ${message}`);
      sessionStorage.clear();
      setGameState(initialState);
      navigate("/join");
    }); // No cleanup function needed here to avoid disconnecting on re-renders.
    // The socket will persist for the lifetime of the provider.
  }, [navigate]);

  // Effect for handling navigation after a new session is created
  useEffect(() => {
    if (
      gameState.sessionId &&
      window.location.pathname.indexOf(`/game/${gameState.sessionId}`) === -1
    ) {
      console.log(
        `New session detected (${gameState.sessionId}), navigating to game page.`
      );
      navigate(`/game/${gameState.sessionId}`);
    }
  }, [gameState.sessionId, navigate]);
   const updateSettings = useCallback((newSettings: GameSettings) => {
        if (gameState.roomId && socketRef.current) {
            // 1. Optimistic Update: Change the state locally for instant UI feedback
            setGameState(prev => ({ ...prev, settings: newSettings }));
            
            // 2. Emit to Server: Send the new settings to the backend for persistence
            socketRef.current.emit('update-settings', { 
                roomId: gameState.roomId, 
                settings: newSettings 
            });
        }
    }, [gameState.roomId]);
  // --- Action Handlers ---
  const createRoom = useCallback(
    (data: any) => socketRef.current?.emit("create-room", data),
    []
  );
  const joinRoom = useCallback(
    (data: any) => socketRef.current?.emit("join-room", data),
    []
  );
  const startGame = useCallback(
    (roomId: number) => socketRef.current?.emit("start-game", roomId),
    []
  );
  const submitAnswer = useCallback(
    (data: any) => socketRef.current?.emit("submit-answer", data),
    []
  );
  const requestNextQuestion = useCallback((roomId: number | null) => {
    if (roomId) socketRef.current?.emit("request-next-question", roomId);
  }, []);
  const endGame = useCallback(() => {
    if (gameState.roomId) socketRef.current?.emit("end-game", gameState.roomId);
    sessionStorage.clear();
    setGameState(initialState);
    navigate("/dashboard");
  }, [gameState.roomId, navigate]);

  const fetchFinalResults = useCallback(async (sessionId: string | null) => {
    const userId = sessionStorage.getItem("quizUserId");
    if (!userId || !sessionId) return alert("User or session ID is missing.");
    try {
      const response = await fetch(
        `${SERVER_URL}/api/session/${sessionId}/results?userId=${userId}`
      );
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data: ResultsPayload = await response.json();
      setGameState((prev) => ({ ...prev, finalResults: data }));
    } catch (error) {
      console.error("Failed to fetch final results:", error);
      alert("Could not load game results.");
    }
  }, []);

  const value = useMemo(
    () => ({
      gameState,
      createRoom,
      joinRoom,
      startGame,
      submitAnswer,
      requestNextQuestion,
      endGame,
      fetchFinalResults,
      updateSettings
    }),
    [
      gameState,
      createRoom,
      joinRoom,
      startGame,
      submitAnswer,
      requestNextQuestion,
      endGame,
      fetchFinalResults,
      updateSettings
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
