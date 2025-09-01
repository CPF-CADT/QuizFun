import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { GameState, GameSettings } from "../../context/GameContext";

const FaCrown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
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
      className={`${
        enabled ? "bg-purple-400" : "bg-gray-300"
      } relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
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

const ParticleEffect: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-ping"
        style={{
          left: `${20 + i * 15}%`,
          top: `${10 + i * 8}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: "2s",
        }}
      />
    ))}
  </div>
);

const FloatingEmoji: React.FC<{ emoji: string; delay: number }> = ({
  emoji,
  delay,
}) => (
  <div
    className="absolute text-sm animate-bounce opacity-70"
    style={{
      animation: `float 3s ease-in-out infinite ${delay}s, fadeInOut 6s ease-in-out infinite ${delay}s`,
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 80 + 10}%`,
    }}
  >
    {emoji}
  </div>
);

interface LobbyViewProps {
  gameState: GameState;
  onStartGame: (roomId: number) => void;
  onSettingsChange: (settings: GameSettings) => void;
      onExit: () => void;

}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  onStartGame,
  onSettingsChange,
  onExit
}) => {
  const { roomId, participants, yourUserId, settings } = gameState;
  const shareableLink = `${window.location.origin}/join?joinRoomCode=${roomId}`;
  const me = participants.find((p) => p.user_id === yourUserId);
  const isHost = me?.role === "host";
  const [isCopied, setIsCopied] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(true);
      setTimeout(() => setPulseEffect(false), 1000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const floatingEmojis = ["🎮", "🎯", "🚀", "⭐", "🎉", "🏆"];

  return (
    <div className="relative w-full max-w-2xl">
      {/* Floating Emojis */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingEmojis.map((emoji, i) => (
          <FloatingEmoji key={i} emoji={emoji} delay={i * 0.8} />
        ))}
      </div>

      <div className="relative bg-gradient-to-br from-purple-100 via-purple-50 to-purple-200 backdrop-blur-md rounded-2xl p-6 shadow-md border border-purple-200 text-center">
        <ParticleEffect />

        {/* Title */}
        <h1 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300">
          🎉 Game Lobby
        </h1>
        <p className="text-gray-700 mb-4 text-sm">
          Invite your friends & get ready 🚀
        </p>

        {/* PIN + QR */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white/70 p-4 rounded-xl shadow-inner">
          <div className="text-center md:text-left">
            <p className="font-semibold mb-1 text-gray-600 text-xs">
              Join with Game PIN:
            </p>
            <p
              className={`text-4xl font-extrabold tracking-widest text-purple-600 ${
                pulseEffect ? "scale-110 text-pink-500" : ""
              }`}
            >
              {roomId}
            </p>
          </div>
          <div className="flex justify-center items-center bg-white p-2 rounded-lg shadow-md">
            <QRCodeSVG value={shareableLink} size={120} level="H" />
          </div>
        </div>

        {/* Share Link */}
        <div className="mt-4">
          <p className="font-semibold text-xs mb-1 text-left text-gray-600">
            Or share this link:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareableLink}
              className="w-full bg-white p-2 rounded-lg text-xs text-gray-800 border border-purple-200 focus:outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={handleCopy}
              className="bg-purple-400 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-purple-300 transition-colors w-24 shadow-sm text-xs"
            >
              {isCopied ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="mt-4 bg-white/70 p-4 rounded-xl max-h-48 overflow-y-auto border border-purple-200">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-700">
            👥 Players ({participants.length})
          </h2>
          <ul className="space-y-2 text-left text-xs">
            {participants.map((player) => (
              <li
                key={player.user_id}
                className="flex items-center justify-between bg-purple-100 p-2 rounded-lg hover:bg-purple-200 transition-colors"
              >
                <span className="font-medium text-gray-800">
                  {player.user_name}
                </span>
                {player.role === "host" && (
                  <span className="text-xs font-bold text-purple-600 flex items-center gap-1">
                    <FaCrown className="w-3 h-3" /> HOST
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Settings (Host Only) */}
        {isHost && (
          <div className="mt-4 bg-white/70 p-4 rounded-xl space-y-3 border border-purple-200">
            <h3 className="text-sm font-semibold text-left text-gray-700">
              ⚙️ Game Settings
            </h3>
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
          </div>
        )}

        {/* Start / Waiting */}
        <div className="mt-6">
          {isHost ? (
            <button
              onClick={() => roomId && onStartGame(roomId)}
              disabled={participants.length < 2}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-300 hover:to-emerald-400 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold py-2.5 rounded-lg text-sm shadow-md transition-all hover:scale-[1.02]"
            >
              {participants.length < 2
                ? "Waiting for at least 1 player..."
                : `🚀 Start Game (${participants.length} players)`}
            </button>
          ) : (
            <p className="text-sm animate-pulse text-gray-600">
              Waiting for host to start...
            </p>
          )}
        </div>
        <button
          onClick={onExit}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-transform duration-300 hover:scale-105 shadow-lg"
        >
          Exit Game
        </button>
      </div>
    </div>
  );
};
