import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuizGame } from "../context/GameContext";
import { FaArrowLeft, FaRocket, FaArrowRight } from "react-icons/fa";

// Helper to generate a unique ID for guest players
const generateGuestId = () => `guest_${Math.random().toString(36).substring(2, 10)}`;

// A loading component for the auto-join process
const AutoJoiningScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-white p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
        <h2 className="text-2xl font-bold">Joining Game...</h2>
        <p className="text-lg opacity-80">Please wait a moment.</p>
    </div>
);


const Joingame: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { joinRoom, gameState } = useQuizGame();
    const [searchParams] = useSearchParams();

    const [gamePin, setGamePin] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAutoJoining, setIsAutoJoining] = useState(false);

    // Effect 1: Read the game PIN from the URL when the component loads.
    useEffect(() => {
        // ✅ FIX: Changed "code" to "joinRoomCode" to match the URL in your screenshot.
        const roomCodeFromUrl = searchParams.get("joinRoomCode");
        if (roomCodeFromUrl) {
            setGamePin(roomCodeFromUrl);
        }
    }, [searchParams]);

    // Effect 2: Attempt to auto-join if the user is logged in and we have a PIN.
    useEffect(() => {
        if (gamePin && isAuthenticated && user) {
            console.log("Auto-joining as logged-in user:", user.name);
            setIsAutoJoining(true);
            
            const joinData = {
                roomId: parseInt(gamePin),
                username: user.name,
                userId: user._id,
            };
            joinRoom(joinData);
        }
    }, [gamePin, isAuthenticated, user, joinRoom]);

    // Effect 3: Listen for errors from the server via the GameContext.
    useEffect(() => {
        if (gameState.error) {
            setIsLoading(false);
            setIsAutoJoining(false);
            setError(gameState.error);
        }
    }, [gameState.error]);

    // This function is now only for guests or manual entry.
    const handleManualJoin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!gamePin) return setError("Please enter a Game PIN.");
        if (!isAuthenticated && !playerName) return setError("Please enter your nickname to join as a guest.");

        setIsLoading(true);
        const joinData = {
            roomId: parseInt(gamePin),
            username: isAuthenticated ? user!.name : playerName,
            userId: isAuthenticated ? user!._id : generateGuestId(),
        };
        joinRoom(joinData);
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
            style={{ 
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 25%, #C084FC 50%, #9b92c6ff 75%, #8B5CF6 100%)',
            }}
        >
            <button onClick={() => navigate('/')} className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-all z-20">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2"><FaArrowLeft /></div>
                <span className="hidden sm:inline font-medium">Back to Home</span>
            </button>

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-gradient-to-br from-purple-600/90 via-purple-500/90 to-indigo-800/90 backdrop-blur-xl w-full p-8 rounded-3xl shadow-2xl border border-white/20">
                    
                    {isAutoJoining ? (
                        <AutoJoiningScreen />
                    ) : (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-5xl font-black mb-3 text-white">Join the Fun!</h1>
                                <p className="text-gray-300 text-xl font-medium">Enter game details to start</p>
                            </div>

                            <form onSubmit={handleManualJoin} className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold mb-4 text-white uppercase tracking-wider">Game PIN</label>
                                    <input
                                        type="text"
                                        value={gamePin}
                                        onChange={(e) => setGamePin(e.target.value.replace(/\D/g, ""))}
                                        placeholder="Enter PIN"
                                        className="w-full px-6 py-6 rounded-2xl text-gray-800 text-center text-3xl font-black tracking-[0.3em] bg-gray-50 outline-none focus:ring-4 focus:ring-purple-300/50"
                                        required
                                    />
                                </div>

                                {!isAuthenticated && (
                                    <div>
                                        <label className="block text-sm font-bold mb-4 text-white uppercase tracking-wider">Your Nickname</label>
                                        <input
                                            type="text"
                                            value={playerName}
                                            onChange={(e) => setPlayerName(e.target.value)}
                                            placeholder="Enter your awesome name"
                                            className="w-full px-6 py-6 rounded-2xl text-gray-800 text-center text-2xl font-bold bg-gray-50 outline-none focus:ring-4 focus:ring-cyan-300/50"
                                            required
                                        />
                                    </div>
                                )}
                                
                                {error && (
                                    <div className="bg-red-500/20 border border-red-500/50 text-white text-center p-3 rounded-xl">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 disabled:from-gray-400 disabled:to-gray-600 text-white font-black py-6 rounded-2xl shadow-2xl group"
                                >
                                    <div className="relative flex items-center justify-center space-x-4">
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-7 w-7 border-4 border-white border-t-transparent"></div>
                                                <span className="text-xl font-bold">Joining...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaRocket className="text-2xl" />
                                                <span className="text-2xl font-black tracking-wide">ENTER GAME</span>
                                                <FaArrowRight className="text-xl group-hover:translate-x-2 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Joingame;