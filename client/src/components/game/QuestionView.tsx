import React, { useEffect, useState, useMemo } from "react";
import type { GameState } from "../../context/GameContext";
import { Trophy } from "lucide-react";
// 1. Import the SecureTextCanvas component
import { SecureTextCanvas } from "./SecureTextCanvas";

interface QuestionViewProps {
  gameState: GameState;
  onSubmitAnswer: (index: number) => void;
  onNextQuestion: () => void;
  userSeleted?: number | null;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  gameState,
  onSubmitAnswer,
  onNextQuestion,
  userSeleted,
}) => {
  const {
    question,
    yourUserId,
    participants,
    currentQuestionIndex,
    totalQuestions,
    questionStartTime,
    settings,
  } = gameState;
  const [timeLeft, setTimeLeft] = useState(question?.timeLimit || 0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const me = participants.find((p) => p.user_id === yourUserId);
  const isHost = me?.role === "host";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAnswerLocked = useMemo(() => {
    if (settings.allowAnswerChange) return false;
    return !!me?.hasAnswered || isSubmitting;
  }, [settings.allowAnswerChange, me?.hasAnswered, isSubmitting]);

  useEffect(() => {
    if (userSeleted === undefined) {
      return;
    }
    setSelectedOption(userSeleted);
    setIsSubmitting(false);
  }, [currentQuestionIndex, userSeleted]);

  useEffect(() => {
    if (!questionStartTime || !question?.timeLimit) {
      setTimeLeft(question?.timeLimit || 0);
      return;
    }
    const updateTimer = () => {
      const elapsed = (Date.now() - questionStartTime) / 1000;
      const remaining = Math.max(0, question.timeLimit - elapsed);
      setTimeLeft(Math.ceil(remaining));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [questionStartTime, question?.timeLimit, currentQuestionIndex]);

  if (!question || !me) {
    return (
      <div className="text-2xl font-bold animate-pulse">
        Loading next question...
      </div>
    );
  }

  const handlePlayerAnswer = (index: number) => {
    if (isHost || isAnswerLocked) return;
    if (settings.allowAnswerChange && index === selectedOption) return;
    setSelectedOption(index);
    onSubmitAnswer(index);
    if (!settings.allowAnswerChange) {
      setIsSubmitting(true);
    }
  };

  const getAnswerButtonClass = (index: number) => {
    const base =
      "w-full text-left p-4 rounded-xl transition-all duration-300 transform border-2 shadow-lg group";
    const colors = [
      "border-purple-400 bg-purple-500/30 hover:bg-purple-500/50 hover:shadow-purple-400/50",
      "border-emerald-400 bg-emerald-500/30 hover:bg-emerald-500/50 hover:shadow-emerald-400/50",
      "border-orange-400 bg-orange-500/30 hover:bg-orange-500/50 hover:shadow-orange-400/50",
      "border-rose-400 bg-rose-500/30 hover:bg-rose-500/50 hover:shadow-rose-400/50",
    ];

    if (isHost)
      return `${base} bg-gray-800/50 border-gray-700 cursor-not-allowed`;

    const isSelected = index === selectedOption;

    if (isAnswerLocked) {
      return isSelected
        ? `${base} bg-gradient-to-br from-blue-500 to-blue-600 ring-4 ring-blue-300 scale-105 cursor-not-allowed`
        : `${base} bg-gray-700 text-gray-400 opacity-70 cursor-not-allowed`;
    }

    if (settings.allowAnswerChange && isSelected) {
      return `${base} bg-gray-500 text-gray-200 opacity-50 cursor-not-allowed`;
    }
    if (isSelected) {
      return `${base} bg-blue-500/60 border-blue-300 scale-105 shadow-blue-300/60`;
    }
    return `${base} ${
      colors[index % 4]
    } cursor-pointer hover:scale-105 hover:-rotate-1`;
  };

  const renderHeader = () => (
    <header className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <span className="font-bold text-lg">{me.score.toLocaleString()}</span>
      </div>
      <div className="text-center font-bold text-xl">
        Question {currentQuestionIndex + 1} / {totalQuestions}
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <span
          className={`text-4xl font-bold ${
            timeLeft > 5 ? "text-white" : "text-red-400 animate-ping"
          }`}
        >
          {timeLeft}
        </span>
      </div>
    </header>
  );

  const sortedPlayers = useMemo(
    () =>
      [...participants]
        .filter((p) => p.role === "player")
        .sort((a, b) => b.score - a.score),
    [participants]
  );

  return (
    <div className="w-full h-full min-h-screen flex flex-col">
      {renderHeader()}
      <main
        className={`flex-1 flex p-8 gap-8 ${
          isHost
            ? "flex-row items-start"
            : "flex-col items-center justify-center"
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-8 flex-1">
          {/* 2. Replaced the h1 with SecureTextCanvas */}
          <div className="w-full max-w-5xl">
            <SecureTextCanvas
              text={question.questionText}
              fontSize={40}
              fontWeight="bold"
              textAlign="center"
              className="w-full"
            />
          </div>

          {question.imageUrl && (
            <div className="w-full max-w-md">
              <img
                src={question.imageUrl}
                alt="Question"
                className="w-full rounded-xl shadow-lg object-contain max-h-80 mx-auto"
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {question.options.map((answer, index) => (
              <button
                key={index}
                onClick={() => handlePlayerAnswer(index)}
                className={getAnswerButtonClass(index)}
                disabled={
                  isHost ||
                  isAnswerLocked ||
                  (settings.allowAnswerChange && selectedOption === index)
                }
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  {/* 3. Replaced the span with SecureTextCanvas and the layout fix */}
                  <div className="flex-1 min-w-0">
                    <SecureTextCanvas
                      text={answer.text}
                      fontSize={20}
                      fontWeight="600"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
          {isHost && !settings.autoNext && (
            <button
              onClick={onNextQuestion}
              className="mt-8 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Next Question
            </button>
          )}
          {!isHost && isAnswerLocked && (
            <p className="text-lg animate-pulse">
              Answer submitted! Waiting for results...
            </p>
          )}
        </div>
        {isHost && (
          <div className="w-full md:w-1/3 bg-black/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6 self-stretch">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Live Leaderboard
            </h2>
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto">
              {sortedPlayers.map((p, i) => (
                <li
                  key={p.user_id}
                  className="flex justify-between items-center bg-white/10 p-3 rounded-lg text-lg"
                >
                  <span className="font-semibold">
                    #{i + 1} {p.user_name}
                  </span>
                  <span className="font-bold text-yellow-300">
                    {p.score.toLocaleString()} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};