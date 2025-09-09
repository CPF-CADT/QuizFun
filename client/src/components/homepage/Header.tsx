import React from "react";
import { BiUser } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import UserProfile from "./UserProfile";

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between px-4 py-1 bg-white text-black shadow-md sticky top-0 z-50 h-14 sm:h-18">
      {/* Logo */}
      <div className="flex items-center ml-4 h-full">
        <img
          src="./image/logo.png"
          alt="Fun Quiz"
          className="h-full object-contain"
        />
      </div>

      {/* User/Login */}
      <div className="flex items-center mr-4">
        {user ? (
          <UserProfile />
        ) : (
          <button
            onClick={() => (window.location.href = "/Login")}
            className="flex items-center gap-2 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: "#A24FF6" }}
          >
            <BiUser className="text-lg" />
            <span className="hidden sm:inline">Login / Sign up</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
