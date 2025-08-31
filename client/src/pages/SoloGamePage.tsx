import React, { useEffect, useReducer, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { soloGameApi, type ISoloQuestion, type ISoloRestoredState } from '../service/soloGameApi';
import { SoloPreGameLobby } from '../components/game/SoloPreGameLobby';
import { SoloQuestionView } from '../components/game/SoloQuestionView';
import { SoloResultsView } from '../components/game/SoloResultsView';
import { SoloGameOverView } from '../components/game/SoloGameOverView';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';
import { useAuth } from '../context/AuthContext';

// --- State and Action Types for the Reducer ---
type View = 'loading' | 'pregame' | 'question' | 'results' | 'end';

interface State {
    view: View;
    quizId?: string; // Can be undefined now
    sessionId?: string;
    playerName: string;
    score: number;
    currentQuestionIndex: number;
    totalQuestions: number;
    question?: ISoloQuestion;
    lastResult?: { wasCorrect: boolean; correctOptionId: string; scoreGained: number; newTotalScore: number; };
}

type Action =
    | { type: 'SESSION_LOADED'; payload: ISoloRestoredState & { playerName: string } }
    | { type: 'GAME_STARTED'; payload: { sessionId: string; totalQuestions: number; question: ISoloQuestion; playerName: string } }
    | { type: 'SHOW_PREGAME'; payload: { quizId: string } }
    | { type: 'SET_LOADING' }
    | { type: 'ANSWER_SUBMITTED'; payload: State['lastResult'] }
    | { type: 'NEXT_QUESTION'; payload: { score: number; question: ISoloQuestion } }
    | { type: 'GAME_FINISHED'; payload: { score: number } };

// --- The Reducer Function ---
const initialState: State = {
    view: 'loading',
    playerName: 'Guest',
    score: 0,
    currentQuestionIndex: 0,
    totalQuestions: 0,
};

function soloGameReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_LOADING': return { ...state, view: 'loading' };
        case 'SHOW_PREGAME': return { ...initialState, view: 'pregame', quizId: action.payload.quizId };
        case 'SESSION_LOADED': return { ...state, view: 'question', ...action.payload };
        case 'GAME_STARTED': return { ...state, view: 'question', ...action.payload, score: 0, currentQuestionIndex: 0 };
        case 'ANSWER_SUBMITTED': return { ...state, view: 'results', lastResult: action.payload };
        case 'NEXT_QUESTION': return { ...state, view: 'question', score: action.payload.score, question: action.payload.question, currentQuestionIndex: state.currentQuestionIndex + 1 };
        case 'GAME_FINISHED': return { ...state, view: 'end', score: action.payload.score };
        default: return state;
    }
}

// --- The Main Component ---
const SoloGamePage: React.FC = () => {
    // ✅ IMPROVED: Get both possible params. Only one will be defined at a time.
    const { quizId, sessionId } = useParams<{ quizId?: string, sessionId?: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [state, dispatch] = useReducer(soloGameReducer, initialState);
    const [isPerformanceModalOpen, setPerformanceModalOpen] = useState(false);

    // ✅ IMPROVED: This effect handles both team and public solo games
    useEffect(() => {
        const initialize = async () => {
            // --- TEAM FLOW ---
            // If we have a sessionId, we load the game directly.
            if (sessionId) {
                try {
                    const restoredState = await soloGameApi.getGameState(sessionId);
                    const playerName = user?.name || 'Player'; // Team players are always logged in
                    dispatch({ type: 'SESSION_LOADED', payload: { ...restoredState, playerName } });
                } catch (error) {
                    console.error("Failed to load team solo session", error);
                    alert("This game session is no longer available.");
                    navigate('/dashboard'); // Go back to dashboard if session fails
                }
            } 
            // --- PUBLIC FLOW ---
            // Otherwise, if we have a quizId, we use the original logic.
            else if (quizId) {
                const existingSessionId = sessionStorage.getItem(`soloSession_${quizId}`);
                if (existingSessionId) {
                    try {
                        const restoredState = await soloGameApi.getGameState(existingSessionId);
                        const playerName = user?.name || 'Player';
                        dispatch({ type: 'SESSION_LOADED', payload: { ...restoredState, playerName } });
                    } catch (error) {
                        sessionStorage.removeItem(`soloSession_${quizId}`);
                        dispatch({ type: 'SHOW_PREGAME', payload: { quizId } });
                    }
                } else {
                    dispatch({ type: 'SHOW_PREGAME', payload: { quizId } });
                }
            } else {
                // If neither ID is present, it's an invalid URL.
                navigate('/');
            }
        };
        initialize();
    }, [quizId, sessionId, navigate, user]);
    
    // This function is now only for starting NEW public games
    const handleStartGame = useCallback(async (playerName: string) => {
        if (!quizId) return;
        dispatch({ type: 'SET_LOADING' });
        try {
            const apiResponse = await soloGameApi.start(quizId, playerName);
            sessionStorage.setItem(`soloSession_${quizId}`, apiResponse.sessionId);
            // After starting, we navigate to the session-based URL for consistency.
            navigate(`/solo/session/${apiResponse.sessionId}`, { replace: true });
        } catch (error) {
            alert("Could not start quiz. Please try again later.");
            dispatch({ type: 'SHOW_PREGAME', payload: { quizId } });
        }
    }, [quizId, navigate]);

    // This function doesn't need to change.
    const handleSubmitAnswer = useCallback(async (optionIndex: number, answerTimeMs: number) => {
        if (!state.sessionId || !state.question) return;
        const optionId = optionIndex === -1 ? null : state.question.options[optionIndex]._id;
        const response = await soloGameApi.submitAnswer(state.sessionId, {
            questionId: state.question._id,
            optionId: optionId!,
            answerTimeMs,
        });
        const newTotalScore = state.score + response.scoreGained;
        dispatch({
            type: 'ANSWER_SUBMITTED',
            payload: { wasCorrect: response.wasCorrect, correctOptionId: response.correctOptionId, scoreGained: response.scoreGained, newTotalScore },
        });
        setTimeout(() => {
            if (response.isGameOver || !response.nextQuestion) {
                soloGameApi.finish(state.sessionId!);
                dispatch({ type: 'GAME_FINISHED', payload: { score: newTotalScore } });
            } else {
                dispatch({ type: 'NEXT_QUESTION', payload: { score: newTotalScore, question: response.nextQuestion } });
            }
        }, 3000);
    }, [state.sessionId, state.question, state.score]);

    const handleViewPerformance = () => {
        setPerformanceModalOpen(true);
    };

    return (
        <>
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
                {state.view === 'loading' && <div className="text-xl font-semibold animate-pulse">Loading...</div>}
                
                {/* Pregame lobby is only shown for new public games */}
                {state.view === 'pregame' && state.quizId && <SoloPreGameLobby quizId={state.quizId} onStart={handleStartGame} />}
                
                {state.view === 'question' && state.question && <SoloQuestionView key={state.question._id} sessionId={state.sessionId!} question={state.question} score={state.score} currentQuestionIndex={state.currentQuestionIndex} totalQuestions={state.totalQuestions} onSubmitAnswer={handleSubmitAnswer} />}
                {state.view === 'results' && state.question && state.lastResult && <SoloResultsView question={state.question} lastResult={state.lastResult} currentScore={state.lastResult.newTotalScore} />}
                {state.view === 'end' && state.sessionId && (
                    <SoloGameOverView 
                        finalScore={state.score} 
                        sessionId={state.sessionId} 
                        onViewResults={handleViewPerformance}
                    />
                )}
            </div>
            {isPerformanceModalOpen && state.sessionId && (
                 <PerformanceDetailModal
                    isOpen={isPerformanceModalOpen}
                    onClose={() => setPerformanceModalOpen(false)}
                    sessionId={state.sessionId}
                    playerIdentifier={user ? { userId: user._id } : { guestName: state.playerName }}
                />
            )}
        </>
    );
};

export default SoloGamePage;