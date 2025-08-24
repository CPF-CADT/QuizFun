import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuizGame, type GameState } from '../context/GameContext';
import {QRCodeSVG} from 'qrcode.react'; // You need to run: npm install qrcode.react

const LobbyPage: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>(); // Get session ID from URL
    const { gameState, startGame } = useQuizGame();
    const { roomId, participants, yourUserId }: GameState = gameState;
    const navigate = useNavigate();

    const shareableLink = `${window.location.origin}/join?sessionId=${sessionId}`;

    useEffect(() => {
        // If the user lands here but the context has no session, they might be stale.
        // A robust implementation could try to rejoin the session using the sessionId from the URL.
        // For now, we'll redirect if the context doesn't sync up.
        if (!gameState.sessionId || gameState.sessionId !== sessionId) {
            const timer = setTimeout(() => {
                if (!gameState.roomId) {
                    console.log("Session mismatch or not found, redirecting.");
                    navigate('/join');
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [sessionId, gameState.sessionId, gameState.roomId, navigate]);

    if (!roomId || !sessionId) {
        return <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white">Connecting...</div>;
    }

    const me = participants.find(p => p.user_id === yourUserId);
    const isHost = me?.role === 'host';
    // const host = participants.find(p => p.role === 'host');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
                    <h1 className="text-4xl font-bold mb-2">Game Lobby</h1>
                    <p className="text-white/80 text-lg">Get your friends to join!</p>
                    
                    {/* --- SHARING SECTION --- */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-black/20 p-4 rounded-xl">
                        <div className="text-center md:text-left">
                            <p className="font-semibold mb-2">Join with Game PIN:</p>
                            <p className="text-5xl font-bold tracking-widest text-yellow-300">{roomId}</p>
                            <p className="font-semibold mt-4 mb-2">Or share this link:</p>
                            <input type="text" readOnly value={shareableLink} className="w-full bg-white/10 p-2 rounded text-sm text-center md:text-left" onClick={(e) => (e.target as HTMLInputElement).select()} />
                        </div>
                        <div className="flex justify-center items-center bg-white p-2 rounded-lg">
                            <QRCodeSVG value={shareableLink} size={160} bgColor="#ffffff" fgColor="#000000" />
                        </div>
                    </div>

                    <div className="mt-8 bg-white/10 p-4 rounded-xl max-h-64 overflow-y-auto">
                        <h2 className="text-xl font-semibold mb-4">Players ({participants.length})</h2>
                        {/* Player list remains the same */}
                        <ul className="space-y-3 text-left">
                           {participants.map((player) => (
                               <li key={player.user_id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                                   <span>{player.user_name}</span>
                                   {player.role === 'host' && <span className="text-xs font-bold text-yellow-300">HOST</span>}
                               </li>
                           ))}
                        </ul>
                    </div>

                    <div className="mt-8">
                        {isHost ? (
                            <button onClick={() => startGame(roomId)} disabled={participants.length < 1} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 font-bold py-4 rounded-xl">
                                {participants.length < 1 ? 'Waiting for players...' : `Start Game (${participants.length} players)`}
                            </button>
                        ) : (
                           <p className="text-lg animate-pulse">Waiting for host to start...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LobbyPage;
