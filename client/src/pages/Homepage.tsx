import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/homepage/Header.tsx';
import HeroSection from '../components/homepage/HeroSection.tsx';
import FeaturesSection from '../components/homepage/FeaturesSection';
import ThemesSection from '../components/homepage/Section.tsx';
import CTASection from '../components/homepage/CTASection.tsx';
import Footer from '../components/homepage/Footer.tsx';
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
      < Header />
      <HeroSection
        handleProtectedRoute={handleProtectedRoute}
      />
      <FeaturesSection />
      <ThemesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Homepage;