import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to homepage after logout
  };

  // Effect to close the dropdown if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) {
    return null; // Should not render if there is no user
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button to toggle the dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 font-semibold hover:text-purple-600 transition-colors focus:outline-none"
      >
        {user.profileUrl ? (
          <img
            src={user.profileUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full border-2 border-purple-500"
          />
        ) : (
          // fallback if no image
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block">Welcome, {user.name}!</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50 border border-gray-200 animate-fade-in-down">
          <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-3">
            {user.profileUrl ? (
              <img
                src={user.profileUrl}
                alt={user.name}
                className="w-12 h-12 rounded-full border object-cover"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>

          <a
            href="/dashboard"
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FaTachometerAlt className="text-gray-500" />
            <span>Dashboard</span>
          </a>
          <a
            href="/profile-settings"
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FaCog className="text-gray-500" />
            <span>Settings</span>
          </a>
          <div className="border-t border-gray-200 my-1"></div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
