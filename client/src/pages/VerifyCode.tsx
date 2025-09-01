// src/pages/VerifyCode.tsx
import React, { useState, type ChangeEvent, useEffect } from "react";
import { FaArrowLeft, FaGamepad, FaKey } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../service/api"; // make sure to add verifyCode and resendCode methods
import { FaRocket, FaStar, FaBook, FaHeart } from "react-icons/fa";
const VerifyCode: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";

  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/signup"); // if no email, go back to signup
    }
  }, [email, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setLoading(true);
    setError("");
    setResendMessage("");

    try {
      const response = await authApi.verifyEmail({email, code});
      alert(response.data.message || "Verification successful!");
      navigate("/dashboard"); // redirect to Dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setResendMessage("");

    try {
      const response = await authApi.requestCode({email});
      setResendMessage(response.data.message || "Verification code resent!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  const isFormValid = code.length === 6;

  return (
  <div
    className="min-h-screen flex items-center justify-center relative overflow-hidden md:px-4 md:py-8"
    style={{
      background:
        "linear-gradient(135deg, #8B5CF6 100%, #A855F7 25%, #C084FC 50%, #9b92c6ff 75%, #8B5CF6 100%)",
    }}
  >
    {/* Floating Educational Elements - Hidden on mobile, visible on desktop */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
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

    {/* Back Button - Hidden on mobile, visible on desktop */}
    <button
      onClick={() => navigate("/login")}
      className="absolute top-6 left-6 items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 hover:scale-105 z-20 hidden md:flex"
    >
      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
        <FaArrowLeft />
      </div>
      <span className="font-medium">Back to Login</span>
    </button>

    {/* Main Verify Code Card - Full screen on mobile, normal on desktop */}
    <div
      className="w-full h-screen md:h-auto md:bg-gradient-to-br md:from-purple-600/90 md:via-purple-500/90 md:to-indigo-800/90 
               bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-800
               backdrop-blur-xl md:max-w-md md:mx-4 p-6 md:p-8 rounded-none md:rounded-3xl shadow-2xl 
               border-0 md:border border-white/20 relative z-10 md:transform md:hover:scale-[1.02] 
               transition-all duration-300 flex flex-col justify-start pt-16 md:justify-center md:pt-0"
    >
      {/* Mobile Back Button - Only visible on mobile */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 flex items-center justify-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 md:hidden"
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
          <FaArrowLeft />
        </div>
      </button>

      {/* Logo & Title */}
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-xl mb-4 mx-auto">
          <img src="/image/logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-full" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
          Verify Your Account
        </h1>
        <p className="text-gray-200 text-base md:text-lg">
          Enter the 6-digit code sent to **{email}**
        </p>
      </div>

      {/* Code Input */}
      <div className="space-y-4 md:space-y-5">
        <div className="group">
          <label className="block text-sm font-semibold text-gray-100 mb-2">
            Verification Code
          </label>
          <div className="relative">
            <FaKey className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400 transition-colors text-sm md:text-base" />
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={handleInputChange}
              className="w-full pl-10 md:pl-12 pr-12 md:pr-14 py-3 md:py-4 bg-white/95 border-2 border-transparent rounded-2xl 
                         text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
                         focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 text-base md:text-lg 
                         tracking-widest text-center font-bold"
              placeholder="______"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-300 px-3 py-2 animate-fadeIn">
          <svg
            className="w-4 h-4 text-red-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}
      {resendMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-300 px-3 py-2 animate-fadeIn">
          <svg
            className="w-4 h-4 text-green-500 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-green-600">{resendMessage}</p>
        </div>
      )}

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!isFormValid || loading}
        className={`w-full font-bold mt-6 py-3 md:py-4 rounded-2xl transition-all duration-300 transform shadow-xl text-base md:text-lg ${
          isFormValid && !loading
            ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white hover:scale-105 hover:shadow-2xl"
            : "bg-gray-400/50 text-gray-300 cursor-not-allowed"
        }`}
      >
        {loading ? "Verifying..." : "Verify Code"}
      </button>

      {/* Resend Code */}
      <div className="text-center mt-6">
        <p className="text-gray-200 text-sm">
          Didn’t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-4 decoration-2 transition-all duration-300"
          >
            {resendLoading ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>
    </div>
  </div>
);
};

export default VerifyCode;
