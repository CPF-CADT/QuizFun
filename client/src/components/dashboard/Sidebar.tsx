import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  BarChart3,
  Settings,
  Compass,
  X,
  Star,
  Users,
  Layers,
  History,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  currentTime: Date;
}

const sidebarItems = [
  {
    name: "Dashboard",
    icon: Activity,
    section: "dashboard",
    color: "from-violet-500 to-purple-400",
  },
  {
    name: "My Quizz",
    icon: Layers,
    section: "my-quizz",
    color: "from-green-500 to-green-300",
  },
  {
    name: "My History",
    icon: History,
    section: "my-history",
    color: "from-rose-500 to-pink-400",
  },
  {
    name: "Teams",
    icon: Users,
    section: "teams",
    color: "from-cyan-500 to-teal-400",
  },
  {
    name: "Explore",
    icon: Compass,
    section: "explore",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "My Library",
    icon: BookOpen,
    section: "library",
    color: "from-emerald-500 to-teal-600",
  },
  {
    name: "Report",
    icon: BarChart3,
    section: "report",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Settings",
    icon: Settings,
    section: "settings",
    color: "from-slate-500 to-gray-600",
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  sidebarOpen,
  setSidebarOpen,
  currentTime,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col shadow-2xl transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-4 lg:p-8 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                {/* Logo Image */}
                <img
                  src="./image/logo.png"
                  alt="QuizzKH Logo"
                  className="w-14 h-14 lg:w-20 lg:h-20 object-contain"
                />
                {/* Platform Name */}
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    <span className="text-blue-600">Quizz</span>
                    <span className="text-red-600">KH</span>
                  </h1>
                  <p className="text-gray-500 text-xs lg:text-sm">
                    Educational Platform
                  </p>
                </div>
              </a>
            </div>
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info card */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-4 lg:mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-gray-900 font-semibold text-sm lg:text-base">
                  {user?.name || "Guest User"}
                </p>
                <p className="text-gray-500 text-xs lg:text-sm">Player</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-xs font-medium">
                  {currentTime.toLocaleDateString()}
                </p>
                <p className="text-violet-600 text-xs lg:text-sm font-mono">
                  {currentTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">Online</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-6 space-y-1 lg:space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.section}
              onClick={() => {
                setActiveSection(item.section);
                setSidebarOpen(false);
                navigate(`/${item.section}`);
              }}
              className={`w-full flex items-center px-3 lg:px-4 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-medium transition-all duration-300 group relative ${
                activeSection === item.section
                  ? "bg-gradient-to-r from-violet-50 to-purple-50 text-violet-700 shadow-lg shadow-violet-500/10 border border-violet-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div
                className={`p-2 lg:p-2.5 rounded-lg lg:rounded-xl mr-3 lg:mr-4 transition-all duration-300 ${
                  activeSection === item.section
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                }`}
              >
                <item.icon className="w-4 h-4" />
              </div>
              <span className="flex-1 text-left text-sm lg:text-base">
                {item.name}
              </span>
              {activeSection === item.section && (
                <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Pro upgrade section */}
        <div className="p-3 lg:p-6 border-t border-gray-200/50">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-amber-100">
            <div className="flex items-center mb-2 lg:mb-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg lg:rounded-xl flex items-center justify-center mr-2 lg:mr-3">
                <Star className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Go Pro</p>
                <p className="text-xs text-gray-600">Unlock premium features</p>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg lg:rounded-xl text-xs lg:text-sm transition-all duration-300 transform hover:scale-105 shadow-lg">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
