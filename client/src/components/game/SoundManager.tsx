// src/components/game/SoundManager.tsx (CORRECTED)

import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export type SoundEffect = 'correct' | 'incorrect' | 'tick' | null;
export type MusicTrack = 'in-game' | 'game-over' | null;

interface SoundManagerProps {
    soundEffectToPlay: SoundEffect;
    musicToPlay: MusicTrack;
}

export const unlockAudioContext = async () => {
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("Audio context started!");
    }
};

export const SoundManager: React.FC<SoundManagerProps> = ({ soundEffectToPlay, musicToPlay }) => {
    const musicPlayers = useRef<Record<string, HTMLAudioElement>>({});
    const sfxPlayers = useRef<Record<string, Tone.Player>>({});
    const synth = useRef<Tone.Synth | null>(null);
    const tickLoop = useRef<Tone.Loop | null>(null);

    useEffect(() => {
        musicPlayers.current = {
            'in-game': new Audio("/sounds/in-game.mp3"),
            'game-over': new Audio("/sounds/game-over.mp3"),
        };
        musicPlayers.current['in-game'].loop = true;
        musicPlayers.current['game-over'].loop = true;
        
        sfxPlayers.current = {
            correct: new Tone.Player("/sounds/correct.mp3").toDestination(),
            incorrect: new Tone.Player("/sounds/incorrect.mp3").toDestination(),
        };

        synth.current = new Tone.Synth().toDestination();
        tickLoop.current = new Tone.Loop(time => {
            synth.current?.triggerAttackRelease('C5', '16n', time);
        }, "1s");
        
        Tone.Transport.start();

        return () => {
            Tone.Transport.stop();
            Object.values(sfxPlayers.current).forEach(p => p.dispose());
            Object.values(musicPlayers.current).forEach(p => p.pause());
            synth.current?.dispose();
            tickLoop.current?.dispose();
        };
    }, []);

    useEffect(() => {
        if (soundEffectToPlay !== 'tick' && tickLoop.current?.state === 'started') {
            tickLoop.current.stop();
        }

        if (!soundEffectToPlay) return;

        if (soundEffectToPlay === 'tick') {
            if (tickLoop.current?.state !== 'started') {
                tickLoop.current?.start(0);
            }
        } else {
            const player = sfxPlayers.current[soundEffectToPlay];
            player?.start();
        }
    }, [soundEffectToPlay]);

    useEffect(() => {
        Object.values(musicPlayers.current).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        if (musicToPlay) {
            const music = musicPlayers.current[musicToPlay];
            if (music) {
                music.play().catch(error => {
                    console.warn("Audio autoplay was blocked by the browser.", error);
                });
            }
        }
    }, [musicToPlay]);

    return null;
};