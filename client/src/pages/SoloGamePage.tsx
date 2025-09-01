import React, { useEffect, useReducer, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { soloGameApi, type ISoloQuestion, type ISoloRestoredState } from '../service/soloGameApi';
import { useAuth } from '../context/AuthContext';
import { SoundManager, unlockAudioContext, type SoundEffect, type MusicTrack } from '../components/game/SoundManager';
import { SoloPreGameLobby } from '../components/game/SoloPreGameLobby';
import { SoloQuestionView } from '../components/game/SoloQuestionView';
import { SoloResultsView } from '../components/game/SoloResultsView';
import { SoloGameOverView } from '../components/game/SoloGameOverView';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';

// --- State and Reducer ---
type View = 'loading' | 'pregame' | 'question' | 'results' | 'end';
interface State { view: View; quizId?: string; sessionId?: string; playerName: string; score: number; currentQuestionIndex: number; totalQuestions: number; question?: ISoloQuestion; lastResult?: { wasCorrect: boolean; correctOptionId: string; scoreGained: number; newTotalScore: number; }; }
type Action = | { type: 'SESSION_LOADED'; payload: ISoloRestoredState & { playerName: string } } | { type: 'GAME_STARTED'; payload: { sessionId: string; totalQuestions: number; question: ISoloQuestion; playerName: string } } | { type: 'SHOW_PREGAME'; payload: { quizId: string } } | { type: 'SET_LOADING' } | { type: 'ANSWER_SUBMITTED'; payload: State['lastResult'] } | { type: 'NEXT_QUESTION'; payload: { score: number; question: ISoloQuestion } } | { type: 'GAME_FINISHED'; payload: { score: number } };
const initialState: State = { view: 'loading', playerName: '', score: 0, currentQuestionIndex: 0, totalQuestions: 0 };
function soloGameReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SET_LOADING': return { ...state, view: 'loading' };
        case 'SHOW_PREGAME': return { ...initialState, view: 'pregame', quizId: action.payload.quizId, playerName: '' };
        case 'SESSION_LOADED': return { ...state, view: 'question', ...action.payload };
        case 'GAME_STARTED': return { ...state, view: 'question', ...action.payload, score: 0, currentQuestionIndex: 0 };
        case 'ANSWER_SUBMITTED': return { ...state, view: 'results', lastResult: action.payload };
        case 'NEXT_QUESTION': return { ...state, view: 'question', score: action.payload.score, question: action.payload.question, currentQuestionIndex: state.currentQuestionIndex + 1 };
        case 'GAME_FINISHED': return { ...state, view: 'end', score: action.payload.score };
        default: return state;
    }
}

const SoloGamePage: React.FC = () => {
    const { quizId, sessionId } = useParams<{ quizId?: string, sessionId?: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [state, dispatch] = useReducer(soloGameReducer, initialState);
    const [isPerformanceModalOpen, setPerformanceModalOpen] = useState(false);
    const [sfxToPlay, setSfxToPlay] = useState<SoundEffect>(null);
    const [musicToPlay, setMusicToPlay] = useState<MusicTrack>(null);
    const [isMusicOn, setIsMusicOn] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            const targetSessionId = sessionId || (quizId ? sessionStorage.getItem(`soloSession_${quizId}`) : null);
            if (targetSessionId) {
                try {
                    const restoredState = await soloGameApi.getGameState(targetSessionId);
                    const playerName = user?.name || sessionStorage.getItem(`soloPlayerName_${targetSessionId}`) || 'Player';
                    sessionStorage.setItem(`soloPlayerName_${targetSessionId}`, playerName);
                    dispatch({ type: 'SESSION_LOADED', payload: { ...restoredState, playerName } });
                } catch (error) {
                    if (quizId) sessionStorage.removeItem(`soloSession_${quizId}`);
                    dispatch({ type: 'SHOW_PREGAME', payload: { quizId: quizId! } });
                }
            } else if (quizId) {
                dispatch({ type: 'SHOW_PREGAME', payload: { quizId } });
            } else {
                navigate('/');
            }
        };
        initialize();
    }, [quizId, sessionId, navigate, user]);
    
    useEffect(() => {
        if (state.view === 'question') setSfxToPlay('tick');
        else if (state.view === 'results') setSfxToPlay(state.lastResult?.wasCorrect ? 'correct' : 'incorrect');
        else setSfxToPlay(null);

        if (isMusicOn) {
            switch(state.view) {
                case 'pregame': setMusicToPlay('lobby'); break;
                case 'question': setMusicToPlay('in-game'); break;
                case 'end': setMusicToPlay('game-over'); break;
                default: setMusicToPlay(null);
            }
        } else {
            setMusicToPlay(null);
        }
    }, [state.view, state.lastResult, isMusicOn]);

    const handleStartGame = useCallback(async (playerName: string) => {
        if (!state.quizId) return;
        await unlockAudioContext();
        setIsMusicOn(true);
        dispatch({ type: 'SET_LOADING' });
        try {
            const guestName = isAuthenticated ? undefined : playerName;
            const apiResponse = await soloGameApi.start(state.quizId, guestName);
            sessionStorage.setItem(`soloSession_${state.quizId}`, apiResponse.sessionId);
            sessionStorage.setItem(`soloPlayerName_${apiResponse.sessionId}`, playerName);
            navigate(`/solo/session/${apiResponse.sessionId}`, { replace: true });
        } catch (error) {
            alert("Could not start quiz.");
            dispatch({ type: 'SHOW_PREGAME', payload: { quizId: state.quizId } });
        }
    }, [state.quizId, navigate, isAuthenticated]);

    const handleSubmitAnswer = useCallback(async (optionIndex: number, answerTimeMs: number) => {
        if (!state.sessionId || !state.question) return;
        setSfxToPlay(null);
        const optionId = optionIndex === -1 ? null : state.question.options[optionIndex]._id;
        const response = await soloGameApi.submitAnswer(state.sessionId, { questionId: state.question._id, optionId: optionId!, answerTimeMs });
        const newTotalScore = state.score + response.scoreGained;
        dispatch({ type: 'ANSWER_SUBMITTED', payload: { ...response, newTotalScore } });
        setTimeout(() => {
            if (response.isGameOver || !response.nextQuestion) {
                soloGameApi.finish(state.sessionId!);
                dispatch({ type: 'GAME_FINISHED', payload: { score: newTotalScore } });
            } else {
                dispatch({ type: 'NEXT_QUESTION', payload: { score: newTotalScore, question: response.nextQuestion } });
            }
        }, 3000);
    }, [state.sessionId, state.question, state.score]);

    const handleViewPerformance = () => setPerformanceModalOpen(true);
    const handleToggleMusic = () => setIsMusicOn(prev => !prev);

    return (
        <>
            <SoundManager soundEffectToPlay={sfxToPlay} musicToPlay={musicToPlay} />
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
                {state.view === 'loading' && <div className="text-xl font-semibold animate-pulse">Loading...</div>}
                
                {state.view === 'pregame' && state.quizId && <SoloPreGameLobby quizId={state.quizId} onStart={handleStartGame} isMusicOn={isMusicOn} onToggleMusic={handleToggleMusic} />}
                
                {state.view === 'question' && state.question && <SoloQuestionView key={state.question._id} sessionId={state.sessionId!} question={state.question} score={state.score} currentQuestionIndex={state.currentQuestionIndex} totalQuestions={state.totalQuestions} onSubmitAnswer={handleSubmitAnswer} />}
                
                {state.view === 'results' && state.question && state.lastResult && <SoloResultsView question={state.question} lastResult={state.lastResult} currentScore={state.lastResult.newTotalScore} />}
                
                {state.view === 'end' && state.sessionId && <SoloGameOverView finalScore={state.score} sessionId={state.sessionId} onViewResults={handleViewPerformance} />}
            </div>
            {isPerformanceModalOpen && state.sessionId && (
                <PerformanceDetailModal
                    isOpen={isPerformanceModalOpen}
                    onClose={() => setPerformanceModalOpen(false)}
                    sessionId={state.sessionId}
                    playerIdentifier={isAuthenticated && user ? { userId: user._id } : { guestName: state.playerName }}
                />
            )}
        </>
    );
};

export default SoloGamePage;