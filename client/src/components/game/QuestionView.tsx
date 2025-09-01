import { useEffect ,useState, useMemo } from 'react';
import { Trophy, Clock, Users, Zap, Award } from 'lucide-react';

// Mock data for demonstration
const mockGameState = {
  question: {
    questionText: "What are Flex Items?",
    options: [
      { text: "The parent container" },
      { text: "The CSS property for flex-direction" },
      { text: "The items inside the container" },
      { text: "The gap between rows" }
    ],
    timeLimit: 30
  },
  yourUserId: "player1",
  participants: [
    { user_id: "player1", user_name: "You", score: 1250, role: "player", hasAnswered: false },
    { user_id: "host1", user_name: "Quiz Master", score: 0, role: "host", hasAnswered: false },
    { user_id: "player2", user_name: "Alice", score: 1100, role: "player", hasAnswered: true },
    { user_id: "player3", user_name: "Bob", score: 950, role: "player", hasAnswered: false },
    { user_id: "player4", user_name: "Charlie", score: 800, role: "player", hasAnswered: true }
  ],
  currentQuestionIndex: 1,
  totalQuestions: 10,
  questionStartTime: Date.now(),
  settings: {
    allowAnswerChange: false,
    autoNext: true
  }
};

const QuestionView = ({ 
  gameState = mockGameState, 
  onSubmitAnswer = () => {}, 
  onNextQuestion = () => {}, 
  userSelected = null 
}) => {
  const { question, yourUserId, participants, currentQuestionIndex, totalQuestions, settings } = gameState;
  const [timeLeft, setTimeLeft] = useState(question?.timeLimit || 30);

useEffect(() => {
  // Reset timer whenever the question changes
  setTimeLeft(question?.timeLimit || 20);

  const interval = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(interval); // stop at 0
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [question]);

  const [selectedOption, setSelectedOption] = useState<number | null>(userSelected);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const me = participants.find(p => p.user_id === yourUserId);
  const isHost = me?.role === 'host';
  
  const isAnswerLocked = useMemo(() => {
    if (settings.allowAnswerChange) return false;
    return !!me?.hasAnswered || isSubmitting;
  }, [settings.allowAnswerChange, me?.hasAnswered, isSubmitting]);

  // Timer animation
  const timeProgress = (timeLeft / (question?.timeLimit || 30)) * 100;
  const isTimeRunningOut = timeLeft <= 5;

  const handlePlayerAnswer = (index : number) => {
    if (isHost || isAnswerLocked) return;
    if (settings.allowAnswerChange && index === selectedOption) return;
    
    setSelectedOption(index);
    onSubmitAnswer(index);
    
    if (!settings.allowAnswerChange) {
      setIsSubmitting(true);
    }
  };

  const getAnswerButtonClass = (index : number) => {
    const baseClass = "relative overflow-hidden group transition-all duration-300 transform hover:rotate-1";
    const colors = [
      { bg: "from-purple-400 to-pink-500", border: "border-purple-300", glow: "shadow-purple-400/40", emoji: "🟣" },
      { bg: "from-green-400 to-emerald-500", border: "border-green-300", glow: "shadow-green-400/40", emoji: "🟢" },
      { bg: "from-yellow-400 to-orange-500", border: "border-yellow-300", glow: "shadow-yellow-400/40", emoji: "🟡" },
      { bg: "from-pink-400 to-rose-500", border: "border-pink-300", glow: "shadow-pink-400/40", emoji: "🔴" }
    ];

    if (isHost) return `${baseClass} bg-gray-600/50 border-2 border-gray-500 cursor-not-allowed`;
    
    const isSelected = index === selectedOption;
    const color = colors[index % 4];

    if (isAnswerLocked && isSelected) {
      return `${baseClass} bg-gradient-to-r from-cyan-400 to-blue-500 border-2 border-cyan-300 scale-110 shadow-xl shadow-cyan-400/50 animate-pulse`;
    }
    
    if (isAnswerLocked) {
      return `${baseClass} bg-gray-600/30 border-2 border-gray-500 opacity-50`;
    }

    if (isSelected && !settings.allowAnswerChange) {
      return `${baseClass} bg-gradient-to-r ${color.bg} border-2 ${color.border} scale-110 shadow-xl ${color.glow} animate-bounce`;
    }

    return `${baseClass} bg-gradient-to-r ${color.bg}/30 border-2 ${color.border} hover:${color.bg}/60 hover:scale-110 hover:shadow-xl ${color.glow} cursor-pointer hover:-rotate-2`;
  };

  const sortedPlayers = useMemo(() => 
    [...participants].filter(p => p.role === 'player').sort((a, b) => b.score - a.score), 
    [participants]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 text-white relative overflow-hidden">
      {/* Fun animated background with floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400/30 rounded-full blur-sm animate-bounce"></div>
        <div className="absolute top-1/3 right-20 w-16 h-16 bg-green-400/40 rotate-45 blur-sm animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-orange-400/30 rounded-full blur-sm animate-ping delay-1000"></div>
        <div className="absolute top-2/3 right-1/3 w-12 h-12 bg-cyan-400/40 rotate-12 blur-sm animate-bounce delay-700"></div>
        
        {/* Large gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-pink-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Confetti-like particles */}
        <div className="absolute top-16 left-1/2 w-2 h-8 bg-yellow-400 rotate-45 animate-spin opacity-70"></div>
        <div className="absolute top-32 right-1/4 w-2 h-6 bg-pink-400 rotate-12 animate-pulse opacity-60"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-60 right-1/3 w-4 h-4 bg-green-400 rotate-45 animate-bounce opacity-60"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Score */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-2xl shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-300">Your Score</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  {me?.score.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* Question Progress */}
            <div className="text-center">
              <div className="text-sm text-gray-300 mb-1">Progress</div>
              <div className="flex items-center space-x-2">
                <div className="text-xl font-bold">Question {currentQuestionIndex + 1}</div>
                <div className="text-gray-400">/</div>
                <div className="text-xl text-gray-400">{totalQuestions}</div>
              </div>
              <div className="w-48 h-2 bg-gray-700 rounded-full mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center">
                  <div className={`text-3xl font-bold ${isTimeRunningOut ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {timeLeft}
                  </div>
                </div>
                <svg className="absolute inset-0 w-20 h-20 transform -rotate-90">
                 <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={226}
                    strokeDashoffset={226 - (226 * timeProgress) / 100}
                    className={`transition-all duration-1000 ease-linear ${isTimeRunningOut ? "text-red-500" : "text-blue-500"}`}
                  />

                </svg>
              </div>
              <div className="text-sm text-gray-300">
                <Clock className="w-4 h-4 mb-1" />
                Time Left
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className={`flex gap-8 ${isHost ? 'flex-row' : 'flex-col'}`}>
          {/* Question Area */}
          <div className="flex-1 space-y-8">
            {/* Question Title */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-400/30 shadow-lg">
                <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-sm font-bold text-yellow-100">⚡ Lightning Round ⚡</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-200 via-white to-cyan-200 bg-clip-text text-transparent leading-tight drop-shadow-lg animate-pulse">
                {question?.questionText} 🤔
              </h1>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {question?.options.map((answer, index) => {
                const emojis = ["🟣", "🟢", "🟡", "🔴"];
                return (
                  <button 
                    key={index}
                    onClick={() => handlePlayerAnswer(index)}
                    className={`${getAnswerButtonClass(index)} p-8 rounded-3xl border-2 backdrop-blur-sm shadow-2xl`}
                    disabled={isHost || isAnswerLocked || (settings.allowAnswerChange && selectedOption === index)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-black border-2 border-white/40 shadow-lg">
                        <span className="text-white">{String.fromCharCode(65 + index)}</span>
                        <span className="text-xs absolute -top-1 -right-1">{emojis[index]}</span>
                      </div>
                      <span className="text-xl font-bold flex-1 text-left drop-shadow-lg">{answer.text}</span>
                      <div className="text-2xl animate-bounce delay-200">✨</div>
                    </div>
                    
                    {/* Fun hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                    
                    {/* Sparkle effect on hover */}
                    <div className="absolute top-2 right-2 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-spin">⭐</div>
                  </button>
                );
              })}
            </div>

            {/* Status Messages */}
            <div className="text-center space-y-4">
              {isHost && !settings.autoNext && (
                <button 
                  onClick={onNextQuestion} 
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  Next Question
                </button>
              )}
              
              {!isHost && isAnswerLocked && (
                <div className="flex items-center justify-center space-x-2 text-xl bg-gradient-to-r from-green-400/20 to-blue-400/20 backdrop-blur-sm px-6 py-3 rounded-full border border-green-400/30">
                  <div className="text-2xl animate-spin">🎉</div>
                  <span className="font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                    Awesome! Waiting for others... 🚀
                  </span>
                  <div className="text-2xl animate-bounce delay-100">⭐</div>
                </div>
              )}
            </div>
          </div>

          {/* Host Leaderboard */}
          {isHost && (
            <div className="w-full md:w-96 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center space-x-2 mb-6">
                <div className="text-2xl animate-bounce">🏆</div>
                <Award className="w-6 h-6 text-yellow-400 animate-pulse" />
                <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Live Leaderboard
                </h2>
                <div className="text-2xl animate-spin delay-500">⭐</div>
              </div>
              
              <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {sortedPlayers.map((player, index) => {
                  const rankEmojis = ["🥇", "🥈", "🥉", "🏅"];
                  return (
                    <div key={player.user_id} className="group">
                      <div className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 p-4 rounded-2xl border border-white/20 hover:from-white/20 hover:to-white/10 transition-all duration-300 hover:scale-105 shadow-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl animate-bounce delay-100">
                            {rankEmojis[index] || "🌟"}
                          </div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse' :
                            index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                            index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                            'bg-gradient-to-r from-purple-400 to-pink-400'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold text-white drop-shadow">{player.user_name}</div>
                            {player.hasAnswered && (
                              <div className="text-xs text-green-300 font-semibold">
                                ✅ Ready to rock! 
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-yellow-200 text-lg drop-shadow">
                            {player.score.toLocaleString()} 🎯
                          </div>
                          <div className="text-xs text-white/70">awesome points!</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-rainbow-400/30 to-rainbow-500/30 rounded-2xl border border-rainbow-400/50 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">Quiz Champions 🎪</span>
                  </span>
                  <span className="font-black text-lg">{sortedPlayers.length} 🚀</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <style >{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default QuestionView;