import React from "react";
import {
  FaChartLine,
  FaStar,
  FaUsers,
  FaTrophy,
  FaGamepad,
  FaWpexplorer,
  FaRocket,
} from "react-icons/fa";
import {
  BookOpen,
  Brain,
  GraduationCap,
  Award,
  Target,
  Calculator,
  Globe,
  PenTool,
  Microscope,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  handleProtectedRoute: (path: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center px-6 py-20 min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundColor: "#A24FF6",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-blue-900/50 to-purple-800/70" />

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center bg-yellow-400 text-purple-900 px-5 py-2 rounded-full font-bold text-sm mb-6 shadow-lg animate-bounce">
          <FaStar className="mr-2" />
          #1 Quiz Platform for Educators
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-r from-yellow-300 via-pink-300 to-blue-300 bg-clip-text text-transparent leading-tight">
          QuizzKH
        </h1>

        {/* Subtitle */}
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-white drop-shadow-lg flex flex-col sm:flex-row items-center justify-center gap-3">
          <FaRocket className="text-yellow-300" />
          <span>
            Get Started in Minutes,{" "}
            <span className="text-yellow-300">See Amazing Results Today!</span>
          </span>
        </h2>

        {/* Description */}
        <p className="max-w-3xl mx-auto text-lg md:text-2xl mb-12 text-gray-100 leading-relaxed">
          Transform your classroom with{" "}
          <span className="text-yellow-300 font-bold">
            engaging quiz games
          </span>
          , smart adaptive learning, and instant progress tracking that students
          absolutely love!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-6 mb-14">
          <Link
            to="/Explore"
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-transform transform hover:scale-110 shadow-xl border border-indigo-400"
          >
            <FaWpexplorer className="group-hover:rotate-12 transition-transform w-6 h-6" />
            Explore
          </Link>
          <Link
            to="/Report"
            className="group flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold px-8 py-4 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-transform transform hover:scale-110 shadow-xl border border-pink-400"
          >
            <FaChartLine className="group-hover:animate-bounce transition-transform w-6 h-6" />
            Reports
          </Link>
          <Link
            to="/join"
            className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-transform transform hover:scale-110 shadow-xl border border-cyan-400"
          >
            <FaGamepad className="group-hover:rotate-12 transition-transform w-6 h-6" />
            Enter Code
          </Link>
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-center">
          {[
            { icon: <FaUsers className="text-blue-300" />, label: "Teachers", value: "50K+" },
            { icon: <FaTrophy className="text-yellow-300" />, label: "Quizzes", value: "2M+" },
            { icon: <FaStar className="text-orange-300" />, label: "Rating", value: "4.9/5" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-5 py-3 shadow-md"
            >
              <div className="mr-2">{stat.icon}</div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-lg">{stat.value}</span>
                <span className="text-gray-300 text-sm">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <GraduationCap className="absolute top-[5%] left-[5%] text-yellow-300 w-8 h-8 opacity-70 animate-pulse" />
        <Award className="absolute top-[10%] right-[10%] text-purple-300 w-10 h-10 opacity-70 animate-spin" />
        <Target className="absolute top-[25%] left-[15%] text-white w-10 h-10 opacity-70 animate-bounce" />
        <BookOpen className="absolute top-[30%] right-[15%] text-teal-300 w-8 h-8 opacity-60 animate-bounce" />
        <Brain className="absolute top-[50%] left-[5%] text-lime-300 w-8 h-8 opacity-70 animate-bounce" />
        <Calculator className="absolute top-[50%] right-[5%] text-pink-400 w-10 h-10 opacity-80 animate-pulse" />
        <Globe className="absolute bottom-[15%] left-[20%] text-blue-300 w-8 h-8 opacity-70 animate-pulse" />
        <PenTool className="absolute bottom-[15%] right-[20%] text-yellow-200 w-8 h-8 opacity-70 animate-bounce" />
        <Microscope className="absolute bottom-[5%] left-[10%] text-red-300 w-8 h-8 opacity-70 animate-pulse" />
        <Users className="absolute bottom-[5%] right-[10%] text-blue-400 w-8 h-8 opacity-80 animate-pulse" />
      </div>
    </section>
  );
};

export default HeroSection;
