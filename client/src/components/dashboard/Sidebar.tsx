import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, BookOpen, BarChart3, Settings, Compass, X, Star,
  Users // CHANGED: Imported the Users icon for the Teams section
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  currentTime: Date;
}

const sidebarItems = [
  { name: 'Dashboard', icon: Activity, section: 'dashboard', color: 'from-violet-500 to-purple-600' },
  { name: 'My Quizz', icon: Activity, section: 'my-quizz', color: 'from-green-500 to-green-300' },
  { name: 'My History', icon: Activity, section: 'my-history', color: 'from-blue-500 to-blue-300' },
  { name: 'Teams', icon: Users, section: 'teams', color: 'from-indigo-500 to-blue-600' },
  { name: 'Explore', icon: Compass, section: 'explore', color: 'from-blue-500 to-cyan-500' },
  { name: 'My Library', icon: BookOpen, section: 'library', color: 'from-emerald-500 to-teal-600' },
  { name: 'Report', icon: BarChart3, section: 'report', color: 'from-orange-500 to-red-500' },
  { name: 'Settings', icon: Settings, section: 'settings', color: 'from-slate-500 to-gray-600' }
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, currentTime }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo Section */}
        <div className="p-8 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div>
                <a href='/'>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Fun Quiz</h1>
                </a>
                <p className="text-gray-500 text-sm">Educational Platform</p>
              </div>
            </div>
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-900 font-semibold">{user?.name || 'Guest User'}</p>
                <p className="text-gray-500 text-sm">Player</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-xs font-medium">{currentTime.toLocaleDateString()}</p>
                <p className="text-violet-600 text-sm font-mono">{currentTime.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.section}
              onClick={() => {
                setActiveSection(item.section);
                setSidebarOpen(false);
                navigate(`/${item.section}`);
              }}
              className={`w-full flex items-center px-4 py-4 rounded-2xl font-medium transition-all duration-300 group relative ${
                activeSection === item.section
                  ? 'bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 shadow-lg shadow-violet-500/10 border border-violet-100'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2.5 rounded-xl mr-4 transition-all duration-300 ${
                activeSection === item.section 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                  : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
              }`}>
                <item.icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left">{item.name}</span>
              {activeSection === item.section && (
                <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200/50">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-3">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Go Pro</p>
                <p className="text-xs text-gray-600">Unlock premium features</p>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all duration-300 transform hover:scale-105 shadow-lg">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;