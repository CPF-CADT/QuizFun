import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { GameState, GameSettings } from "../../context/GameContext";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const FaCrown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 1L6.6 6.4L1 7.2l4.5 4.4L4.2 18L10 15.2L15.8 18l-1.3-6.4L19 7.2l-5.6-.8L10 1z"></path>
  </svg>
);

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between text-left">
    <span className="text-white font-medium">{label}</span>
    <button
      type="button"
      className={`${
        enabled ? "bg-green-500" : "bg-gray-600"
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`${
          enabled ? "translate-x-5" : "translate-x-0"
        } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

interface LobbyViewProps {
  gameState: GameState;
  onStartGame: (roomId: number) => void;
  onSettingsChange: (settings: GameSettings) => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  onStartGame,
  onSettingsChange,
}) => {
  const { roomId, participants, yourUserId, settings } = gameState;
  const shareableLink = `${window.location.origin}/join?joinRoomCode=${roomId}`;
  const me = participants.find((p) => p.user_id === yourUserId);
  const isHost = me?.role === "host";
  const [isCopied, setIsCopied] = useState(false);
  const handleBackToHome = () => {
    sessionStorage.removeItem("quizSessionId");
    sessionStorage.removeItem("quizRoomId");
    sessionStorage.removeItem("quizUserId");
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-white/20 text-center">
      <h1 className="text-4xl font-bold mb-2">Game Lobby</h1>
      <p className="text-white/80 text-lg">Get your friends to join!</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-black/20 p-4 rounded-xl">
        <div className="text-center md:text-left">
          <p className="font-semibold mb-2">Join with Game PIN:</p>
          <p className="text-5xl font-bold tracking-widest text-yellow-300">
            {roomId}
          </p>
        </div>
        <div className="flex justify-center items-center bg-white p-2 rounded-lg">
          <QRCodeSVG value={shareableLink} size={160} level="H" />
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-sm mb-2 text-left text-white/80">
          Or share this link:
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareableLink}
            className="w-full bg-white/10 p-2 rounded text-sm text-center md:text-left text-white/90"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={handleCopy}
            className="bg-indigo-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors w-28"
          >
            {isCopied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white/10 p-4 rounded-xl max-h-64 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Players ({participants.length})
        </h2>
        <ul className="space-y-3 text-left">
          {participants.map((player) => (
            <li
              key={player.user_id}
              className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
            >
              <span>{player.user_name}</span>
              {player.role === "host" && (
                <span className="text-xs font-bold text-yellow-300 flex items-center gap-1">
                  <FaCrown className="w-4 h-4" /> HOST
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isHost && (
        <div className="mt-6 bg-white/10 p-4 rounded-xl space-y-4">
          <h3 className="text-xl font-semibold">Game Settings</h3>
          <ToggleSwitch
            label="Auto-Advance to Next Round"
            enabled={settings.autoNext}
            onChange={(enabled) =>
              onSettingsChange({ ...settings, autoNext: enabled })
            }
          />
          <ToggleSwitch
            label="Allow Players to Change Answer"
            enabled={settings.allowAnswerChange}
            onChange={(enabled) =>
              onSettingsChange({ ...settings, allowAnswerChange: enabled })
            }
          />
          <Link
            to="/dashboard"
            onClick={handleBackToHome}
            className="mt-4 text-indigo-400 hover:text-indigo-300 transition-colors font-medium flex items-center gap-2"
          >
            <Home size={20} /> Back to Home
          </Link>
        </div>
      )}

      <div className="mt-8">
        {isHost ? (
          <button
            onClick={() => roomId && onStartGame(roomId)}
            disabled={participants.length < 2}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed font-bold py-4 rounded-xl transition-colors"
          >
            {participants.length < 2
              ? "Waiting for at least 1 player..."
              : `Start Game (${participants.length} players)`}
          </button>
        ) : (
          <p className="text-lg animate-pulse">Waiting for host to start...</p>
        )}
      </div>
    </div>
  );
};
