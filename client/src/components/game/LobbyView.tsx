import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Users, Settings, Copy, Check, X, Maximize, Crown, PartyPopper, Rocket } from "lucide-react";
import type { GameState, GameSettings } from "../../context/GameContext";
import { unlockAudioContext } from './SoundManager';

const ToggleSwitch: React.FC<{
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}> = ({ label, enabled, onChange }) => (
  <div className="flex items-center justify-between text-left py-2.5">
    <span className="text-gray-700 font-medium text-sm pr-4">{label}</span>
    <button
      type="button"
      className={`${enabled ? "bg-purple-500" : "bg-gray-300"} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500`}
      onClick={() => onChange(!enabled)}
    >
      <span className={`${enabled ? "translate-x-5" : "translate-x-0"} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
    </button>
  </div>
);

const ParticleEffect: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-ping"
                style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 8}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: "3s",
                }} />
        ))}
    </div>
);

export const LobbyView: React.FC<{
  gameState: GameState;
  onStartGame: (roomId: number) => void;
  onSettingsChange: (settings: GameSettings) => void;
  onExit: () => void;
}> = ({ gameState, onStartGame, onSettingsChange, onExit }) => {
  const { roomId, participants, yourUserId, settings } = gameState;
  const shareableLink = `${window.location.origin}/join?joinRoomCode=${roomId}`;
  const me = participants.find((p) => p.user_id === yourUserId);
  const isHost = me?.role === "host";

  const [isCopied, setIsCopied] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleStartGameClick = async () => {
    await unlockAudioContext(); // Unlock audio context on user gesture
    if (roomId) onStartGame(roomId);
  };

  return (
    <>
      <div className="relative w-full max-w-4xl mx-auto my-auto p-2 sm:p-4">
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-200/50">
            <button onClick={onExit} className="absolute top-3 right-3 p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors z-10" aria-label="Exit Game">
                <X size={24} />
            </button>
          <ParticleEffect />
          <header className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              <PartyPopper className="w-8 h-8 mr-3" />
              Game Lobby
            </h1>
            <p className="text-slate-600">Invite friends & get ready for the challenge!</p>
          </header>

          <section className="bg-slate-100/60 p-4 rounded-xl shadow-inner flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-slate-500 text-sm mb-1">Join with Game PIN:</p>
              <p className="text-5xl sm:text-6xl font-extrabold tracking-widest text-indigo-600">{roomId}</p>
            </div>
            <div className="text-center">
                <div className="bg-white p-2 rounded-lg shadow-md inline-block">
                    <QRCodeSVG value={shareableLink} size={72} level="H" />
                </div>
                 <button onClick={() => setIsQrModalOpen(true)} className="mt-2 w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5">
                    <Maximize size={12} /> Show QR
                </button>
            </div>
          </section>

          <section className="mt-4 text-left">
            <div className="flex gap-2">
              <input type="text" readOnly value={shareableLink} className="w-full bg-white p-3 rounded-lg text-sm text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" onClick={(e) => (e.target as HTMLInputElement).select()} />
              <button onClick={handleCopy} className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors w-32 shadow-sm text-sm flex items-center justify-center">
                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5 mr-2" />} {isCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </section>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-100/60 p-4 rounded-xl text-left">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-slate-700">
                <Users size={20} /> Players ({participants.length})
              </h2>
              <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                {participants.map((player) => (
                  <li key={player.user_id} className={`flex items-center justify-between p-2.5 rounded-lg shadow-sm transition-colors ${player.user_id === yourUserId ? 'bg-purple-100' : 'bg-white'}`}>
                    <span className="font-medium text-slate-800">{player.user_name}</span>
                    {player.role === "host" && (
                      <span className="text-xs font-bold text-yellow-500 flex items-center gap-1.5">
                        <Crown className="w-4 h-4" /> HOST
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {isHost && (
              <div className="bg-slate-100/60 p-4 rounded-xl">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-700"><Settings size={20} /> Game Settings</h3>
                <div className="divide-y divide-slate-200">
                  <ToggleSwitch label="Auto-Advance Rounds" enabled={settings.autoNext} onChange={(e) => onSettingsChange({ ...settings, autoNext: e })} />
                  <ToggleSwitch label="Allow Answer Changes" enabled={settings.allowAnswerChange} onChange={(e) => onSettingsChange({ ...settings, allowAnswerChange: e })} />
                </div>
              </div>
            )}
          </div>
          
          <footer className="mt-6">
            {isHost ? (
              <button onClick={handleStartGameClick} disabled={participants.length < 1} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 disabled:text-slate-200 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg flex items-center justify-center gap-2">
                <Rocket className="w-5 h-5" />
                {participants.length < 1 ? "Waiting for players..." : `Start Game (${participants.length} ${participants.length === 1 ? 'player' : 'players'})`}
              </button>
            ) : (
              <p className="text-base text-center font-semibold animate-pulse text-slate-600 py-3">Waiting for host to start...</p>
            )}
          </footer>
        </div>
      </div>
      
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsQrModalOpen(false)}>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
                 <QRCodeSVG value={shareableLink} size={320} className="w-64 h-64 sm:w-80 sm:h-80" />
                 <button onClick={() => setIsQrModalOpen(false)} className="absolute -top-3 -right-3 p-2 bg-white text-gray-500 hover:text-gray-800 rounded-full transition-colors shadow-lg">
                     <X size={24} />
                 </button>
            </div>
        </div>
      )}
    </>
  );
};

