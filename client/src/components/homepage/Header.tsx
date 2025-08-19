import React from "react";
import { BiUser } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import UserProfile from "./UserProfile"; // Import the new component

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-center p-4 bg-white text-black shadow-md sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <img src="./image/logo.png" alt="Fun Quiz" className="h-15" />
      </div>
      <div className="hidden md:flex space-x-8 text-gray-600">
        <a href="#features" className="hover:text-purple-600 transition">Features</a>
        <a href="#pricing" className="hover:text-purple-600 transition">Pricing</a>
        <a href="#about" className="hover:text-purple-600 transition">About</a>
      </div>

      {/* Use a container to manage the position */}
      <div className="mr-4 md:mr-10">
        {user ? (
          // If the user is logged in, render the UserProfile dropdown
          <UserProfile />
        ) : (
          // Otherwise, render the Login button
          <button
            onClick={() => (window.location.href = "/Login")}
            className="flex items-center gap-2 text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: "#A24FF6" }}
          >
            <BiUser className="text-lg" />
            <span>Login / Sign up</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;