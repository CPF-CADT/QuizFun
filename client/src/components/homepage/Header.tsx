// src/components/Header.tsx

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BiUser } from "react-icons/bi";
import { useAuth } from "../../context/AuthContext";
import UserProfile from "./UserProfile";

const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/docs", label: "Docs" },
    { path: "/about-us", label: "About Us" },
  ];

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-sm md:px-8">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" aria-label="QuizzKH Home">
          <img
            src="/image/logo.png" 
            alt="QuizzKH Logo"
            className="h-16 w-auto" 
          />
        </Link>
      </div>

      {/* Centered Navigation */}
      <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <ul className="flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`relative pb-1 font-medium text-gray-600 transition-colors duration-300 hover:text-blue-600 ${
                  location.pathname === item.path
                    ? "text-blue-600 font-semibold"
                    : ""
                }`}
              >
                {item.label}
                {/* Active link indicator */}
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-blue-600"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Actions */}
      <div className="flex items-center">
        {user ? (
          <UserProfile />
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-md"
          >
            <BiUser className="text-lg" />
            <span>Login / Sign up</span>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
