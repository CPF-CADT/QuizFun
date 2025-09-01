import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizGame, type Participant } from '../context/GameContext';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';
import { SoundManager } from '../components/game/SoundManager';
import { Music, MicOff } from 'lucide-react';
import Cookies from "js-cookie";

import { LobbyView } from '../components/game/LobbyView';
import { QuestionView } from '../components/game/QuestionView';
import { ResultsView } from '../components/game/ResultsView';
import { GameOverView } from '../components/game/GameOverView';
import { GameResultDetails } from '../components/game/GameResultDetails';

export type PlayerIdentifier = { userId: string } | { guestName: string };

const GamePage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const {
        gameState,
        sfxToPlay,
        musicToPlay,
        isMusicOn,
        toggleMusic,
        startGame,
        submitAnswer,
        requestNextQuestion,
        fetchFinalResults,
        updateSettings,
        userSeleted,
        endGame
    } = useQuizGame();
    
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerIdentifier | null>(null);
    const navigate = useNavigate();

    const me = useMemo(() =>
        gameState.participants.find((p: Participant) => p.user_id === gameState.yourUserId),
        [gameState.participants, gameState.yourUserId]
    );

    const reconnectedAnswer = useMemo(() => {
        if (userSeleted && userSeleted.questionNo === gameState.currentQuestionIndex) {
            return userSeleted.option;
        }
        return null;
    }, [userSeleted, gameState.currentQuestionIndex]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!gameState || !gameState.sessionId) {
                console.log("No active session found, redirecting.");
                navigate('/dashboard');
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [sessionId, gameState, navigate]);

    const handleViewMyPerformance = () => {
        if (!me) return;
        const isRegistered = /^[0-9a-fA-F]{24}$/.test(gameState.yourUserId || '');
        if (isRegistered) {
            setSelectedPlayer({ userId: gameState.yourUserId! });
        } else {
            setSelectedPlayer({ guestName: me.user_name });
        }
    };
    const handleLeftGame=() =>{
        Cookies.remove("quizSessionId");
        Cookies.remove("quizRoomId");
        Cookies.remove("quizUserId");
        Cookies.remove("quizUserName");
        navigate("/dashboard");
    }

    if (!gameState || !gameState.sessionId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-xl font-semibold">Connecting to Game...</div>
                </div>
            </div>
        );
    }

    const renderGameState = () => {
        if (gameState.finalResults && gameState.sessionId && gameState.yourUserId) {
            return <GameResultDetails
                payload={gameState.finalResults}
                yourUserId={gameState.yourUserId}
                sessionId={gameState.sessionId}
                onExit={(me?.role === 'host')? endGame: handleLeftGame}
                setSelectedPlayer={setSelectedPlayer}
                isHost={me?.role === 'host'}
            />;
        }

        switch (gameState.gameState) {
            case 'lobby':
                return <LobbyView gameState={gameState} onStartGame={startGame} onSettingsChange={updateSettings} onExit={endGame} />;
            case 'question':
                return <QuestionView
                    gameState={gameState}
                    onSubmitAnswer={(optionIndex) => submitAnswer({
                        roomId: gameState.roomId!,
                        userId: gameState.yourUserId!,
                        optionIndex
                    })}
                    onNextQuestion={() => requestNextQuestion(gameState.roomId!)}
                    userSeleted={reconnectedAnswer}
                />;
            case 'results':
                return <ResultsView gameState={gameState} onNextQuestion={() => requestNextQuestion(gameState.roomId!)} />;
            case 'end':
                return <GameOverView
                    isHost={me?.role === 'host'}
                    onFetchResults={() => fetchFinalResults(gameState.sessionId!)}
                    onViewMyPerformance={handleViewMyPerformance}
                    sessionId={gameState.sessionId}
                    userId={gameState.yourUserId}
                    onExit={handleLeftGame}
                />;
            default:
                return <div className="text-xl font-semibold animate-pulse">Loading...</div>;
        }
    };

    return (
        <>
            <SoundManager soundEffectToPlay={sfxToPlay} musicToPlay={musicToPlay} />
            <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-2 sm:p-4 overflow-auto relative">
                
                {/* --- Music Toggle Button --- */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={toggleMusic}
                        className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                        aria-label={isMusicOn ? "Turn music off" : "Turn music on"}
                    >
                        {isMusicOn ? <Music className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-gray-400" />}
                    </button>
                </div>

                <div className="w-full h-full flex items-center justify-center">
                    {renderGameState()}
                </div>

                <PerformanceDetailModal
                    isOpen={selectedPlayer !== null}
                    onClose={() => setSelectedPlayer(null)}
                    sessionId={gameState.sessionId || ''}
                    playerIdentifier={selectedPlayer}
                />
            </div>
        </>
    );
};

export default GamePage;