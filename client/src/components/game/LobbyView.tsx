import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { GameState, GameSettings } from "../../context/GameContext";

const FaCrown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 1L6.6 6.4L1 7.2l4.5 4.4L4.2 18L10 15.2L15.8 18l-1.3-6.4L19 7.2l-5.6-.8L10 1z" />
  </svg>
);

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between text-left">
    <span className="text-gray-700 font-medium text-sm">{label}</span>
    <button
      type="button"
      className={`${enabled ? "bg-green-500" : "bg-gray-600"} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`${
          enabled ? "translate-x-5" : "translate-x-0"
        } inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

interface LobbyViewProps {
  gameState: GameState;
  onStartGame: (roomId: number) => void;
  onSettingsChange: (settings: GameSettings) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({ gameState, onStartGame, onSettingsChange }) => {
    const { roomId, participants, yourUserId, settings } = gameState;
    const shareableLink = `${window.location.origin}/join?joinRoomCode=${roomId}`;
    const me = participants.find((p) => p.user_id === yourUserId);
    const isHost = me?.role === "host";
    const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const floatingEmojis = ["🎮", "🎯", "🚀", "⭐", "🎉", "🏆"];

    return (
        <div className="w-full max-w-lg mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl border-white/20 text-center animate-fade-in-up flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">Game Lobby</h1>
            <p className="text-white/80 text-base sm:text-lg mb-6">Get your friends to join!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-black/20 p-4 rounded-xl mb-4">
                <div className="text-center">
                    <p className="font-semibold mb-1 text-white/90">Game PIN:</p>
                    <p className="text-4xl sm:text-5xl font-bold tracking-widest text-yellow-300">{roomId}</p>
                </div>
                <div className="flex justify-center items-center bg-white p-2 rounded-lg mx-auto">
                    <QRCodeSVG value={shareableLink} size={128} level="H" />
                </div>
            </div>

            <div className="mb-6">
                <div className="flex">
                    <input
                        type="text"
                        readOnly
                        value={shareableLink}
                        className="w-full bg-white/10 p-2 rounded-l-md text-xs sm:text-sm text-center text-white/90"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button onClick={handleCopy} className="bg-indigo-500 text-white font-bold px-3 py-2 rounded-r-md hover:bg-indigo-600 transition-colors w-24 flex items-center justify-center">
                        {isCopied ? <Check size={20}/> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            <div className="bg-white/10 p-4 rounded-xl flex-grow overflow-y-auto max-h-48 sm:max-h-64 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 text-white">Players ({participants.length})</h2>
                <ul className="space-y-2 text-left">
                    {participants.map((player) => (
                        <li key={player.user_id} className="flex items-center justify-between bg-white/5 p-2 rounded-md text-sm sm:text-base">
                            <span className="truncate text-white/90">{player.user_name}</span>
                            {player.role === "host" && (
                                <span className="text-xs font-bold text-yellow-300 flex items-center gap-1">
                                    <Crown className="w-4 h-4" /> HOST
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {isHost && (
                <div className="mb-6 bg-white/10 p-4 rounded-xl space-y-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">Game Settings</h3>
                    <ToggleSwitch
                        label="Auto-Advance"
                        enabled={settings.autoNext}
                        onChange={(enabled) => onSettingsChange({ ...settings, autoNext: enabled })}
                    />
                    <ToggleSwitch
                        label="Change Answer"
                        enabled={settings.allowAnswerChange}
                        onChange={(enabled) => onSettingsChange({ ...settings, allowAnswerChange: enabled })}
                    />
                </div>
            )}

            <div className="mt-auto">
                {isHost ? (
                    <button onClick={() => roomId && onStartGame(roomId)} disabled={participants.length < 1} className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold py-3 rounded-xl transition-colors text-lg">
                        {participants.length < 1 ? "Waiting for players..." : `Start Game`}
                    </button>
                ) : (
                    <p className="text-lg animate-pulse text-white/90">Waiting for host to start...</p>
                )}
                 <Link to="/dashboard" onClick={handleBackToHome} className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center justify-center gap-2 text-sm">
                    <Home size={16} /> Back to Home
                </Link>
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
};
