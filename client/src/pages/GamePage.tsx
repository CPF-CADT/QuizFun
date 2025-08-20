import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizGame, type Participant } from '../context/GameContext';
import { PerformanceDetailModal } from '../components/PerformanceDetailModal';

// Import the new sub-components
import { LobbyView } from '../components/game/LobbyView';
import { QuestionView } from '../components/game/QuestionView';
import { ResultsView } from '../components/game/ResultsView';
import { GameOverView } from '../components/game/GameOverView';
import { GameResultDetails } from '../components/game/GameResultDetails';

export type PlayerIdentifier = { userId: string } | { guestName: string };

const GamePage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const { gameState, startGame, submitAnswer, requestNextQuestion, endGame, fetchFinalResults, updateSettings } = useQuizGame();
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerIdentifier | null>(null);
    const navigate = useNavigate();

    const me = useMemo(() => 
        gameState.participants.find((p: Participant) => p.user_id === gameState.yourUserId),
    [gameState.participants, gameState.yourUserId]);

    useEffect(() => {
        if (!gameState || !gameState.sessionId) {
            const timer = setTimeout(() => {
                if (!gameState || !gameState.sessionId) {
                    console.log("No active session found, redirecting.");
                    navigate('/join');
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [sessionId, gameState, navigate]);

    const isRegisteredUser = (id: string | null): boolean => {
        if (!id) return false;
        return /^[0-9a-fA-F]{24}$/.test(id);
    };

    const handleViewMyPerformance = () => {
        if (!me) return;

        if (isRegisteredUser(gameState.yourUserId)) {
            setSelectedPlayer({ userId: gameState.yourUserId });
        } else {
            setSelectedPlayer({ guestName: me.user_name });
        }
    };

    if (!gameState || !gameState.sessionId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
                <div className="text-2xl font-bold animate-pulse">Initializing Game...</div>
            </div>
        );
    }

    const renderGameState = () => {
        if (gameState.finalResults && gameState.sessionId && gameState.yourUserId) {
             return <GameResultDetails 
                payload={gameState.finalResults} 
                sessionId={gameState.sessionId}
                yourUserId={gameState.yourUserId}
                onExit={endGame} 
                setSelectedPlayer={setSelectedPlayer}
             />;
        }

        switch (gameState.gameState) {
            case 'lobby':
                return <LobbyView gameState={gameState} onStartGame={startGame} onSettingsChange={updateSettings} />;
            case 'question':
                return <QuestionView 
                    gameState={gameState} 
                    onSubmitAnswer={(optionIndex) => submitAnswer({
                        roomId: gameState.roomId,
                        userId: gameState.yourUserId,
                        optionIndex
                    })} 
                    onNextQuestion={() => requestNextQuestion(gameState.roomId)} 
                />;
            case 'results':
                return <ResultsView gameState={gameState} onNextQuestion={() => requestNextQuestion(gameState.roomId)} />;
            case 'end':
                return <GameOverView 
                    isHost={me?.role === 'host'} 
                    onFetchResults={() => fetchFinalResults(gameState.sessionId)} 
                    onViewMyPerformance={handleViewMyPerformance}
                />;
            default:
                return <div className="text-2xl font-bold animate-pulse">Connecting...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-4">
            {renderGameState()}
            <PerformanceDetailModal 
                isOpen={selectedPlayer !== null}
                onClose={() => setSelectedPlayer(null)}
                sessionId={gameState.sessionId || ''}
                playerIdentifier={selectedPlayer}
            />
        </div>
    );
};

export default GamePage;