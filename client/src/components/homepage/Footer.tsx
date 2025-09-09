import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Logo + Name */}
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-between mb-8">
          <div className="flex items-center space-x-2">
            <img src="./image/logo1.png" alt="Fun Quiz" className="h-10" />
            <span className="text-2xl font-bold text-purple-400">
              <span className="text-blue-600">Quizz</span>
              <span className="text-red-500">KH</span>
            </span>
          </div>
          <p className="mt-4 md:mt-0 text-center text-gray-400">
            Making education engaging, interactive, and fun for everyone.
          </p>
        </div>

        {/* Links */}
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Dashboard & Main Pages */}
          <div>
            <h4 className="font-semibold mb-4">Main</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white transition">
                  Docs
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Quiz Pages */}
          <div>
            <h4 className="font-semibold mb-4">Quizzes</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/my-quizz" className="hover:text-white transition">
                  My Quizz
                </Link>
              </li>
              <li>
                <Link to="/library" className="hover:text-white transition">
                  Library
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-white transition">
                  History
                </Link>
              </li>
            </ul>
          </div>

          {/* Team Pages */}
          <div>
            <h4 className="font-semibold mb-4">Team</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/teams" className="hover:text-white transition">
                  Team Dashboard
                </Link>
              </li>
              <li>
                <Link to="/join-team" className="hover:text-white transition">
                  Join Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Settings & Others */}
          <div>
            <h4 className="font-semibold mb-4">Settings</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/settings" className="hover:text-white transition">
                  Settings
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition">
                  Reports
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Fun Quiz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
