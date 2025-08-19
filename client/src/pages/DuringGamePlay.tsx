import React, { useState, useEffect } from "react";
import { Clock, Zap, Trophy, Users } from "lucide-react";

const DuringGamePlay: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(1250);
  const [streak, setStreak] = useState(3);
  const [username, setUsername] = useState("Player1"); // 👈 will come from user input later
    const [rank, setRank] = useState(1); // 👈 example rank


// Mock questions data
const question = [
    {
        id: 1,
        text: "Which planet is known as the 'Red Planet' due to its reddish appearance?",
        answers: [
            "Venus",
            "Mars", 
            "Jupiter",
            "Saturn"
        ],
        correctAnswer: 1
    },
    {
        id: 2,
        text: "Which language is used for styling web pages?",
        answers: ["HTML", "JQuery", "CSS", "XML"],
        correctAnswer: 2,
    }
];
  const totalQuestions = 10;
  const participants = 1247;

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(index);
    }
  };

  const getAnswerButtonClass = (index: number) => {
    const baseClass = "relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 shadow-lg";
    
    if (selectedAnswer === null) {
      const colors = [
        "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 border-purple-400 text-white",
        "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-emerald-400 text-white",
        "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-400 text-white",
        "bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 border-rose-400 text-white"
      ];
      return `${baseClass} ${colors[index]}`;
    }
    
    if (selectedAnswer === index) {
      return `${baseClass} bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white ring-4 ring-blue-300 scale-105`;
    }
    
    return `${baseClass} bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed`;
  };

  const progressPercentage = (currentQuestion / totalQuestions) * 100;
  const timePercentage = (timeLeft / 20) * 100;

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-1/2 w-72 h-72 bg-rose-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header with game stats */}
        <header className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
  <div className="flex items-center space-x-6">
    {/* Username & Rank */}
    <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
      {/* <Zap className="w-5 h-5 text-orange-400" />    */}
      {/* <span className="font-bold">{streak}x</span> */}
      <span className="font-bold">#{rank}</span>
    </div>

    <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
      
      <span>{username}</span>
    </div>

    {/* Score */}
    <div className="flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2">
      <Trophy className="w-5 h-5 text-yellow-400" />
      <span className="font-bold text-lg">{score.toLocaleString()}</span>
    </div>
          </div>

          {/* Timer */}
          <div className="flex items-center space-x-3">
            {/* <Clock className="w-6 h-6 text-white" /> */}
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={timeLeft > 10 ? "#10B981" : "#EF4444"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={283}
                  strokeDashoffset={283 - (283 * timePercentage) / 100}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${timeLeft > 10 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
        </header>


        {/* Main content area */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
          {/* Question */}
          <div className="max-w-4xl w-full text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-emerald-500 rounded-full text-2xl font-bold shadow-lg">
              {currentQuestion}
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {question[currentQuestion - 1].text}
            </h1>
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {question[currentQuestion - 1].answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={getAnswerButtonClass(index)}
                disabled={selectedAnswer !== null}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-xl font-semibold flex-1">
                    {answer}
                  </span>
                </div>
                
                {/* Shimmer effect */}
                {selectedAnswer === null && (
                  <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-1000"></div>
                )}
              </button>
            ))}
          </div>

          {/* Status message */}
          {selectedAnswer !== null && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/50 rounded-full px-6 py-3 backdrop-blur-sm">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium">Answer submitted! Waiting for others...</span>
              </div>
              
              <p className="text-gray-300 text-lg">
                Get ready for the next question!
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DuringGamePlay;