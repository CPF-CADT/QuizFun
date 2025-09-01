import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { AddQuizToTeamModal } from "./AddQuizToTeamModal";
import { teamApi } from "../../service/teamApi";
import { useAuth } from "../../context/AuthContext";
import { useQuizGame } from "../../context/GameContext";

interface TeamQuizListProps {
    teamId: string;
    isOwner: boolean;
}

export const TeamQuizList: React.FC<TeamQuizListProps> = ({ teamId, isOwner }) => {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setAddModalOpen] = useState(false);

    const navigate = useNavigate();
    const { user } = useAuth();
    const { createRoom } = useQuizGame();

    // Fetches the static list of quizzes assigned to the team
    const fetchTeamQuizzes = useCallback(() => {
        setIsLoading(true);
        teamApi.getAssignedQuizzes(teamId)
            .then((res) => setQuizzes(res.data))
            .catch((err) => {
                console.error("Failed to fetch team quizzes:", err);
                setQuizzes([]);
            })
            .finally(() => setIsLoading(false));
    }, [teamId]);

    // This useEffect now only runs once to fetch the data. No sockets.
    useEffect(() => {
        fetchTeamQuizzes();
    }, [fetchTeamQuizzes]);

    // Filters the quiz list based on role
    const displayedQuizzes = useMemo(() => {
        if (isOwner) {
            return quizzes; // Owners see everything
        }
        // Members only see quizzes assigned with 'solo' mode
        return quizzes.filter(q => q.mode === 'solo');
    }, [quizzes, isOwner]);

    // Host starts a private multiplayer game
    const handleHostMultiplayer = (quiz: any) => {
        if (!user) return;
        createRoom({
            quizId: quiz.quizId._id,
            hostName: user.name,
            userId: user._id,
            teamId, // This makes the game private to the team
            settings: { autoNext: true, allowAnswerChange: true },
        });
    };

    // Member starts a solo game
    const handleStartSolo = async (quiz: any) => {
    if (!user) return;
    try {
      const response = await teamApi.startTeamSoloSession(teamId, quiz.quizId._id);
      navigate(`/solo/session/${response.data.sessionId}`);
    } catch (error) {
      console.error("Failed to start solo session:", error);
      alert("Could not start solo game.");
    }
  };

    if (isLoading) {
        return <p className="text-center p-8 text-gray-500">Loading quizzes...</p>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isOwner && (
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                    >
                        <Plus className="w-12 h-12 mb-2" />
                        <span className="font-semibold">Add a New Quiz</span>
                    </button>
                )}

                {displayedQuizzes.length === 0 && (
                    <div className={isOwner ? '' : 'col-span-full'}>
                        <div className="text-center p-10 bg-white rounded-lg border h-full flex flex-col justify-center">
                            <p className="font-semibold text-gray-700">No quizzes available.</p>
                            {!isOwner && <p className="text-gray-500">Ask the team owner to add a solo quiz.</p>}
                        </div>
                    </div>
                )}

                {displayedQuizzes.map((quiz) => {
                    let buttonText: string;
                    let buttonAction: () => void;
                    let buttonClassName = "w-full text-white font-bold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md";

                    if (isOwner) {
                        if (quiz.mode === 'multiplayer') {
                            buttonText = 'Host Game';
                            buttonAction = () => handleHostMultiplayer(quiz);
                            buttonClassName += " bg-gradient-to-r from-emerald-500 to-green-500";
                        } else { // solo
                            buttonText = 'View Results';
                            buttonAction = () => navigate(`/teams/${teamId}/analytics/quiz/${quiz.quizId._id}`);
                            buttonClassName += " bg-gradient-to-r from-gray-500 to-gray-600";
                        }
                    } else { // Member view (can only be solo)
                        buttonText = 'Start Solo';
                        buttonAction = () => handleStartSolo(quiz);
                        buttonClassName += " bg-gradient-to-r from-indigo-500 to-purple-500";
                    }

                    return (
                        <div key={quiz._id} className="bg-white border rounded-xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold truncate pr-2">{quiz.quizId?.title || 'Quiz'}</h3>
                                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap bg-gray-100 text-gray-600">
                                        {quiz.mode.charAt(0).toUpperCase() + quiz.mode.slice(1)}
                                    </div>
                                </div>
                                <p className="text-gray-500 mb-4 text-sm">{quiz.quizId?.questions?.length || 0} Questions</p>
                            </div>
                            <button onClick={buttonAction} className={buttonClassName}>
                                {buttonText}
                            </button>
                        </div>
                    );
                })}
            </div>
            {isOwner && <AddQuizToTeamModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} teamId={teamId} onQuizAdded={fetchTeamQuizzes} />}
        </>
    );
};