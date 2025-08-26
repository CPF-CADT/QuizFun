import React, { useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  FaUser,
  FaLock,
  FaArrowLeft,
  FaGamepad,
  FaRocket,
  FaStar,
  FaBook,
  FaHeart,
} from "react-icons/fa";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const { login } = useAuth();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError("");

    try {
      await login({ email: formData.email, password: formData.password });
      navigate("/dashboard"); // or wherever you want after login
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to sign in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.length > 0 && formData.password.length > 0;
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #8B5CF6 100%, #A855F7 25%, #C084FC 50%, #9b92c6ff 75%, #8B5CF6 100%)",
      }}
    >
      {/* Floating Educational Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Left - Rocket */}
        <div className="absolute top-20 left-10 transform animate-bounce">
          <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 shadow-lg">
            <FaRocket className="text-2xl text-white" />
          </div>
        </div>

        {/* Top Right - Star */}
        <div className="absolute top-32 right-20 transform animate-pulse">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg">
            <FaStar className="text-xl text-white" />
          </div>
        </div>

        {/* Middle Left - Book */}
        <div
          className="absolute top-1/2 left-16 transform -translate-y-1/2 animate-bounce"
          style={{ animationDelay: "1s" }}
        >
          <div className="bg-gradient-to-r from-pink-400 to-red-500 rounded-full p-3 shadow-lg">
            <FaBook className="text-lg text-white" />
          </div>
        </div>

        {/* Bottom Right - Heart */}
        <div
          className="absolute bottom-40 right-16 transform animate-pulse"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-3 shadow-lg">
            <FaHeart className="text-lg text-white" />
          </div>
        </div>

        {/* Bottom Left - Gamepad */}
        <div
          className="absolute bottom-20 left-20 transform animate-bounce"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full p-3 shadow-lg">
            <FaGamepad className="text-lg text-white" />
          </div>
        </div>

        {/* Additional floating shapes */}
        <div className="absolute top-16 right-1/4 w-6 h-6 bg-yellow-300 rounded-full opacity-60 animate-pulse"></div>
        <div
          className="absolute top-3/4 left-1/3 w-4 h-4 bg-green-300 rounded-full opacity-50 animate-bounce"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-5 h-5 bg-pink-300 rounded-full opacity-40 animate-pulse"
          style={{ animationDelay: "0.8s" }}
        ></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 hover:scale-105 z-20"
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
          <FaArrowLeft />
        </div>
        <span className="hidden sm:inline font-medium">Back to Home</span>
      </button>

      {/* Main Login Card */}
      {/* Main Login Card */}
      <div
  className="w-full h-screen md:h-auto md:bg-gradient-to-br md:from-purple-600/90 md:via-purple-500/90 md:to-indigo-800/90 
          bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-800
          backdrop-blur-xl md:max-w-md md:mx-4 p-6 md:p-8 rounded-none md:rounded-3xl shadow-2xl 
          border-0 md:border border-white/20 relative z-10 md:transform md:hover:scale-[1.02] 
          transition-all duration-300 flex flex-col justify-start pt-16 md:justify-center md:pt-0"
>
  {/* Header */}
  <div className="text-center mb-6 md:mb-8">
    <button
      onClick={() => navigate("/")}
      className="absolute top-6 left-6 flex items-center justify-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 md:hidden"
    >
      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
        <FaArrowLeft />
      </div>
    </button>
    <div
      className="inline-flex items-center justify-center w-20 h-20 md:w-20 md:h-20 
              bg-white
              rounded-full mb-4 md:mb-4 shadow-xl md:transform md:hover:rotate-6 
              transition-transform duration-300 mx-auto"
    >
      <img src="/image/logo.png" alt="Logo" className="w-16 h-16 md:w-16 md:h-16 object-contain rounded-full" />
    </div>
    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
      Welcome Back!
    </h1>
    <p className="text-gray-200 text-base md:text-lg">
      Ready to continue your learning adventure?
    </p>
  </div>

  <div className="space-y-4 md:space-y-6">
    {/* Email Input */}
    <div className="group">
      <label className="block mb-2 text-sm font-semibold text-gray-100">
        Email Address
      </label>
      <div className="relative">
        <FaUser className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400 transition-colors text-sm md:text-base" />
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-white/95 border-2 border-transparent rounded-2xl 
               text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
               focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 text-base md:text-lg"
          placeholder="Enter your email"
        />
      </div>
    </div>

    {/* Password Input */}
    <div className="group">
      <label className="block mb-2 text-sm font-semibold text-gray-100">
        Password
      </label>
      <div className="relative">
        <FaLock className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400 transition-colors text-sm md:text-base" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full pl-10 md:pl-12 pr-12 md:pr-14 py-3 md:py-4 bg-white/95 border-2 border-transparent rounded-2xl 
               text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
               focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 text-base md:text-lg"
          placeholder="Enter your password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
        >
          {showPassword ? (
            <AiOutlineEye className="text-lg md:text-xl" />
          ) : (
            <AiOutlineEyeInvisible className="text-lg md:text-xl" />
          )}
        </button>
      </div>
    </div>

    {/* Error Message */}
    {error && (
      <div className="bg-red-500/20 border border-red-400/30 text-red-200 text-sm p-3 md:p-4 rounded-xl backdrop-blur-sm animate-shake">
        {error}
      </div>
    )}

    {/* Sign In Button */}
    <button
      onClick={handleSignIn}
      disabled={!isFormValid || isLoading}
      className={`w-full font-bold py-3 md:py-4 rounded-2xl transition-all duration-300 transform shadow-xl text-base md:text-lg flex items-center justify-center ${
        isFormValid && !isLoading
          ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white hover:scale-105 hover:shadow-2xl"
          : "bg-gray-400/50 text-gray-300 cursor-not-allowed"
      }`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
          Signing In...
        </>
      ) : (
        <>
          <FaRocket className="mr-2 text-sm md:text-base" />
          Let's Go! Sign In
        </>
      )}
    </button>

    <GoogleLoginButton />
  </div>

  {/* Sign Up Link */}
  <div className="text-center mt-6 md:mt-6">
    <p className="text-gray-200 text-sm">
      New to Fun Quiz?{" "}
      <button
        onClick={() => navigate("/signup")}
        className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-4 decoration-2 transition-all duration-300"
      >
        Create an account
      </button>
    </p>
  </div>
</div>
    </div>
  );
};

export default Login;
