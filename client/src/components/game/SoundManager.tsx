import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import lobbySound from '../../assets/sound/lobby.mp3'
import inGameSound from '../../assets/sound/in-game.mp3'
import correctSound from '../../assets/sound/correct.mp3'
import incorrrectSound from '../../assets/sound/incorrect.mp3'
import gameOverSound from '../../assets/sound/game-over.mp3'


// --- TYPE DEFINITIONS ---
export type SoundEffect = 'correct' | 'incorrect' | 'tick' | null;
export type MusicTrack = 'lobby' | 'in-game' | 'game-over' | null;

interface SoundManagerProps {
    soundEffectToPlay: SoundEffect;
    musicToPlay: MusicTrack;
}

// --- AUDIO CONTEXT MANAGEMENT ---
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
export const unlockAudioContext = async () => {
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
        // Also resume Tone.js context if it's not running
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        console.log("Audio context resumed!");
    }
};


// --- MAIN COMPONENT ---
export const SoundManager: React.FC<SoundManagerProps> = ({ soundEffectToPlay, musicToPlay }) => {
    const musicPlayers = useRef<Record<string, HTMLAudioElement>>({});
    const sfxPlayers = useRef<Record<string, Tone.Player>>({});
    const tickInterval = useRef<number | null>(null);
    const [isSfxLoaded, setIsSfxLoaded] = useState(false);

    // This effect runs once to create and load all audio assets
    useEffect(() => {
        // --- Music Players (HTMLAudioElement for looping) ---
        musicPlayers.current = {
            'lobby': new Audio(lobbySound),
            'in-game': new Audio(inGameSound),
            'game-over': new Audio(gameOverSound),
        };
        Object.values(musicPlayers.current).forEach(p => p.loop = true);
        
        // --- SFX Players (Tone.js for precise timing) ---
        sfxPlayers.current = {
            correct: new Tone.Player(correctSound).toDestination(),
            incorrect: new Tone.Player(incorrrectSound).toDestination(),
        };

        // Wait for all Tone.js players to finish loading to prevent errors
        Tone.loaded().then(() => {
            console.log("Sound effects (.mp3) are loaded.");
            setIsSfxLoaded(true); 
        });

        return () => {
            Object.values(sfxPlayers.current).forEach(p => p.dispose());
            Object.values(musicPlayers.current).forEach(p => p.pause());
        };
    }, []);

    useEffect(() => {
        if (soundEffectToPlay !== 'tick' && tickInterval.current) {
            clearInterval(tickInterval.current);
            tickInterval.current = null;
        }

        if (!soundEffectToPlay) return;

        if (soundEffectToPlay === 'tick') {
            if (tickInterval.current) return; // Prevent multiple timers
            const playTick = () => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(880, audioContext.currentTime);
                gain.gain.setValueAtTime(0.08, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.1);
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.1);
            };
            playTick();
            tickInterval.current = window.setInterval(playTick, 1000);
        } else if (isSfxLoaded) {
            const player = sfxPlayers.current[soundEffectToPlay];
            if (player && player.loaded) {
                player.start();
            }
        }
        
        return () => {
             if (tickInterval.current) {
                clearInterval(tickInterval.current);
                tickInterval.current = null;
            }
        }
    }, [soundEffectToPlay, isSfxLoaded]);

    // Effect for playing music
    useEffect(() => {
        Object.values(musicPlayers.current).forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });

        if (musicToPlay && musicPlayers.current[musicToPlay]) {
            musicPlayers.current[musicToPlay].play().catch(error => {
                console.warn(`Could not play music track '${musicToPlay}':`, error.message);
            });
        }
    }, [musicToPlay]);

    return null;
};