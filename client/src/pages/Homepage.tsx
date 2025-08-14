import React from 'react';
import { FaPlus, FaHistory, FaChartLine, FaStar, FaUsers, FaTrophy, FaRocket, FaGamepad, FaBolt } from 'react-icons/fa';
const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans text-white relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white text-black shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <img src="./image/logo.png" alt="Fun Quiz" className="h-15" />
        </div>
        <div className="hidden md:flex space-x-8 text-gray-600">
          <a href="#features" className="hover:text-purple-600 transition">Features</a>
          <a href="#pricing" className="hover:text-purple-600 transition">Pricing</a>
          <a href="#about" className="hover:text-purple-600 transition">About</a>
        </div>
         <button
         onClick={() => (window.location.href = "/Login")}
          className="text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
          style={{ backgroundColor: "#A24FF6" }}
        >
          Login / Sign up
        </button>
      </div>

      {/* Hero Section */}
      <div
        className="flex flex-col items-center justify-center text-center px-4 py-20 bg-cover bg-center bg-no-repeat w-full relative min-h-screen"
        style={{
          backgroundImage: "url('/background.jpg')",
          backgroundColor: '#A24FF6',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      >
        {/* Enhanced overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/50 to-purple-800/70"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Attention-grabbing badge */}
          <div className="inline-flex items-center bg-yellow-400 text-purple-900 px-4 py-2 rounded-full font-bold text-sm mb-6 animate-bounce">
            <FaStar className="mr-2" />
            #1 Quiz Platform for Educators
          </div>

          {/* Main heading with animation */}
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent leading-tight">
            Fun Quiz
          </h1>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white drop-shadow-lg">
            🚀 Get Started in Minutes,<br />
            <span className="text-yellow-300">See Amazing Results Today!</span>
          </h2>

          <p className="max-w-3xl text-xl md:text-2xl mb-12 text-gray-100 leading-relaxed">
            Transform your classroom with <span className="text-yellow-300 font-bold">engaging quiz games</span>, 
            smart adaptive learning, and instant progress tracking that students absolutely love!
          </p>

          {/* Enhanced action buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button className="group flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold px-8 py-4 rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all transform hover:scale-110 shadow-2xl border border-emerald-300">
              <FaPlus className="group-hover:rotate-90 transition-transform" /> Create Quiz
            </button>
            <button 
              className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-110 shadow-2xl border border-indigo-400" 
            >
              <FaHistory className="group-hover:rotate-12 transition-transform" /> Check History
            </button>
            <a href='/Dashboard'>
            <button className="group flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold px-8 py-4 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all transform hover:scale-110 shadow-2xl border border-pink-400" >
              <FaChartLine className="group-hover:bounce transition-transform" /> Reports
            </button>
            </a>
            <button className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all transform hover:scale-110 shadow-2xl border border-cyan-400"
            onClick={()=> (window.location.href = "/join")}>
              <FaGamepad className="inline mr-2 group-hover:rotate-12 transition-transform" /> Enter Code
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <FaUsers className="text-blue-300 mr-2" />
              <span className="font-bold">50K+</span>
              <span className="ml-1 text-gray-300">Teachers</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <FaTrophy className="text-yellow-300 mr-2" />
              <span className="font-bold">2M+</span>
              <span className="ml-1 text-gray-300">Quizzes</span>
            </div>
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <FaStar className="text-orange-300 mr-2" />
              <span className="font-bold">4.9/5</span>
              <span className="ml-1 text-gray-300">Rating</span>
            </div>
          </div>
        </div>

        {/* Floating elements for visual interest */}
        {/* Floating decorative emojis */}
<div className="absolute inset-0 pointer-events-none">
  {/* Row 1 */}
  <div className="absolute top-[5%] left-[5%] text-yellow-300 text-4xl opacity-70 animate-pulse">✨</div>
  <div className="absolute top-[10%] right-[10%] text-purple-300 text-5xl opacity-70 animate-spin">🌟</div>
  
  {/* Row 2 */}
  <div className="absolute top-[25%] left-[15%] text-white text-4xl sm:text-6xl opacity-70 animate-bounce">🎉</div>
  <div className="absolute top-[30%] right-[15%] text-teal-300 text-3xl sm:text-4xl opacity-60 animate-bounce">📚</div>
  
  {/* Row 3 */}
  <div className="absolute top-[50%] left-[5%] text-lime-300 text-3xl opacity-70 animate-bounce">🧠</div>
  <div className="absolute top-[50%] right-[5%] text-pink-400 text-4xl sm:text-5xl opacity-80 animate-pulse">💖</div>
  
  {/* Row 4 */}
  <div className="absolute bottom-[15%] left-[20%] text-blue-300 text-3xl opacity-70 animate-pulse">⚡</div>
  <div className="absolute bottom-[15%] right-[20%] text-yellow-200 text-3xl opacity-70 animate-bounce">🎵</div>
  
  {/* Row 5 */}
  <div className="absolute bottom-[5%] left-[10%] text-red-300 text-3xl sm:text-4xl opacity-70 animate-pulse">💡</div>
  <div className="absolute bottom-[5%] right-[10%] text-blue-400 text-4xl opacity-80 animate-pulse">🎨</div>
</div>


      </div>

      {/* Features Preview Section */}
      <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Teachers <span className="text-purple-600">Love Fun Quiz</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create engaging, educational experiences that boost student participation and learning outcomes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaBolt className="text-3xl text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Lightning Fast Setup</h3>
              <p className="text-gray-600 mb-6">Create professional quizzes in under 2 minutes. Our AI suggests questions based on your topic!</p>
              <div className="bg-gradient-to-r from-orange-400 to-pink-500 h-1 w-12 rounded-full"></div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaChartLine className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Real-Time Insights</h3>
              <p className="text-gray-600 mb-6">Watch student understanding unfold live. Identify learning gaps instantly and adapt on the fly.</p>
              <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 w-12 rounded-full"></div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaGamepad className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Gamified Learning</h3>
              <p className="text-gray-600 mb-6">Turn any lesson into an exciting game. Leaderboards, points, and achievements keep students engaged.</p>
              <div className="bg-gradient-to-r from-green-400 to-blue-500 h-1 w-12 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      <section className="py-20 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">
        Customize Your Quiz Experience
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Choose from beautiful themes that match your style and engage your students.
      </p>
    </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-8 justify-center">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-105 w-full max-w-[600px] aspect-[2/1]"
            >
              <img
                src={`./image/theme${i}.jpg`}
                alt="Quiz Themes"
                className="w-full h-full rounded-lg object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Make Learning <span className="text-yellow-300">Unforgettable?</span>
          </h2>
          <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
            Join thousands of educators who've already transformed their classrooms. Your students will thank you!
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 font-bold px-10 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-110 shadow-2xl">
              <FaRocket className="inline mr-2" />
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white font-bold px-10 py-4 rounded-xl hover:bg-white hover:text-purple-600 transition-all transform hover:scale-110">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-purple-200 mt-4">✅ No credit card required • ✅ Setup in under 5 minutes</p>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="./image/logo.png" alt="Fun Quiz" className="h-10" />
                <span className="text-2xl font-bold text-purple-400">Fun Quiz</span>
              </div>
              <p className="text-gray-400">Making education engaging, interactive, and fun for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Fun Quiz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;