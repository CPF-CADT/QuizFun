import { useState, useEffect, useMemo } from 'react';
import { gameApi, type IGameHistory } from '../service/gameApi';

export type PlayerIdentifier = { userId: string } | { guestName: string } | null;

export const usePerformanceData = (sessionId: string, playerIdentifier: PlayerIdentifier) => {
    const [performance, setPerformance] = useState<IGameHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [player, setPlayer] = useState<{ username?: string; userId?: string }>({});

    useEffect(() => {
        if (!sessionId || !playerIdentifier) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = 'userId' in playerIdentifier
                    ? await gameApi.getUserPerformanceInSession(playerIdentifier.userId, sessionId)
                    : await gameApi.getGuestPerformanceInSession(sessionId, playerIdentifier.guestName);

                const performanceData = Array.isArray(response.data) ? response.data : response.data.performance;
                setPerformance(performanceData || []);

                if (response.data.username) {
                    setPlayer({ username: response.data.username, userId: response.data.userId });
                } else if ('guestName' in playerIdentifier) {
                    setPlayer({ username: playerIdentifier.guestName });
                } else if ('userId' in playerIdentifier) {
                    setPlayer({ userId: playerIdentifier.userId });
                }

            } catch (err) {
                console.error("Failed to fetch performance data:", err);
                setError('Failed to load performance details.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sessionId, playerIdentifier]);

    const summary = useMemo(() => {
        if (!performance || !performance.length) {
            return { score: 0, correct: 0, total: 0, avgTime: "0.00", accuracy: 0 };
        }

        const totalScore = performance.reduce((sum, item) => sum + item.finalScoreGained, 0);
        const correctAnswers = performance.filter(item => item.wasUltimatelyCorrect).length;
        const totalTimeMs = performance.reduce((sum, item) => sum + (item.attempts.at(-1)?.answerTimeMs || 0), 0);
        const totalQuestions = performance.length;

        return {
            score: totalScore,
            correct: correctAnswers,
            total: totalQuestions,
            avgTime: totalQuestions > 0 ? (totalTimeMs / totalQuestions / 1000).toFixed(2) : "0.00",
            accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
        };
    }, [performance]);

    return { loading, error, player, performance, summary };
};