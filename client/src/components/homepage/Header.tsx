import React from "react";
import { BiUser } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import UserProfile from "./UserProfile";

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between p-4 bg-white text-black shadow-md sticky top-0 z-50">
      <div className="flex items-center ml-4">
        <img src="./image/logo.png" alt="Fun Quiz" className="h-10 sm:h-12 md:h-15" />
      </div>

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
    </div>
  );
};

export default Header;
