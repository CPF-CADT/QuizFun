// src/components/Header.tsx
import React from 'react';
import { PlusCircle, ArrowRight, BarChart3, Users, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
  currentTime: Date;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen, currentTime }) => {
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Fun Quize</h1>
        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
          <Bell className="w-5 h-5" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </button>
      </div>

      {/* Main Header */}
      <div className="mb-8 lg:mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-3">
              <span className="bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
                {getGreeting()}
              </span>
            </h1>
            <p className="text-gray-600 text-lg lg:text-xl">Ready to inspire minds today?</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="hidden lg:flex p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 hover:bg-white hover:shadow-lg transition-all duration-300 text-gray-600 hover:text-violet-600 relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full animate-pulse"></div>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <a href="/create-quiz">
            <button className="group px-6 lg:px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-2xl font-semibold shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center">
                <PlusCircle className="w-5 h-5 mr-2" />
                Create Quiz
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </a>
          
          <button className="px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-700 rounded-2xl font-semibold hover:border-violet-300 hover:text-violet-700 hover:shadow-lg hover:bg-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics
            </div>
          </button>
          
          <button className="px-6 lg:px-8 py-4 bg-white/80 backdrop-blur-xl border border-gray-200/50 text-gray-700 rounded-2xl font-semibold hover:border-violet-300 hover:text-violet-700 hover:shadow-lg hover:bg-white transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Students
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Header;
