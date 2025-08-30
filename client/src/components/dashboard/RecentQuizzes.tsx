import React from "react";
import { Link } from "react-router-dom";
import { useQuizGame } from "../../context/GameContext";
import { useAuth } from "../../context/AuthContext";
import { Clock, Edit, Play, FaUsers } from "../common/Icons";
import type { IQuiz } from "../../types/quiz";
import { Share2 } from "lucide-react";

interface RecentQuizzesProps {
  quizzes: IQuiz[];
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Easy":
      return "from-green-400 to-emerald-500";
    case "Medium":
      return "from-yellow-400 to-orange-500";
    case "Hard":
      return "from-red-400 to-rose-500";
    default:
      return "from-gray-400 to-gray-500";
  }
};

const RecentQuizzes: React.FC<RecentQuizzesProps> = ({ quizzes }) => {
  const { createRoom } = useQuizGame();
  const { user } = useAuth();

  const handleLaunch = (quizId: string) => {
    if (!user) {
      alert("You must be logged in to host a game.");
      return;
    }

    console.log(`Launching quiz ${quizId} for user ${user.name}`);
    createRoom({
      quizId: quizId,
      hostName: user.name,
      userId: user._id,
      settings: { autoNext: true, allowAnswerChange: true },
    });
  };

    function handleShareSolo(_id: string): void {
        throw new Error("Function not implemented.");
    }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Quizzes</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz._id}
            className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition-all flex flex-col"
          >
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-800">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mb-3 h-10">
                {quiz.description || "No description provided."}
              </p>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span className="flex items-center">
                  <FaUsers className="w-4 h-4 mr-1.5" />
                  {quiz.questions?.length || 0} questions
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {new Date(quiz.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <Link
                  to={`/quiz-editor/${quiz._id}`}
                  className="p-2 bg-gray-100 hover:bg-violet-100 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleShareSolo(quiz._id)}
                  className="p-2 bg-gray-100 hover:bg-indigo-100 rounded-lg"
                  title="Share Solo Link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleLaunch(quiz._id)}
                  className={`px-4 py-2 bg-gradient-to-r ${getDifficultyColor(
                    quiz.dificulty
                  )} text-white rounded-xl font-semibold flex items-center`}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Launch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentQuizzes;
