import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/homepage/Header.tsx";
import HeroSection from "../components/homepage/HeroSection.tsx";
import FeaturesSection from "../components/homepage/FeaturesSection";
import ThemesSection from "../components/homepage/Section.tsx";
import CTASection from "../components/homepage/CTASection.tsx";
import Footer from "../components/homepage/Footer.tsx";
import { Leaderboard } from "../components/Leaderboard.tsx";
import { Trophy } from "lucide-react";
const Homepage: React.FC = () => {
  const isLoggedIn = (): boolean => {
    const token = localStorage.getItem("authToken");
    if (!token) return false;

    try {
      const base64Url = token.split(".")[1];
      if (!base64Url) return false; // malformed token

      // Convert base64url -> base64
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(base64));

      const currentTime = Math.floor(Date.now() / 1000); // seconds
      return payload.exp && payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  };

  const navigate = useNavigate();

  const handleProtectedRoute = (path: string) => {
    if (isLoggedIn()) {
      navigate(path);
    } else {
      alert("Please log in or sign up first.");
      navigate("/Login");
    }
  };

  return (
    <div className="min-h-screen font-sans text-white relative">
      <Header />
      <HeroSection handleProtectedRoute={handleProtectedRoute} />
      <div className="py-16 sm:py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl mb-6 shadow-sm">
            <Trophy className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Community Champions
          </h2>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            See how you stack up against our top quiz masters and join the competition!
          </p>
        </div>

        <Leaderboard />
      </div>
    </div>
      <FeaturesSection />
      <ThemesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Homepage;
