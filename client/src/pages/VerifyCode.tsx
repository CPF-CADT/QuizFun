import React, { useState, ChangeEvent } from "react";
import { FaArrowLeft, FaGamepad, FaKey } from "react-icons/fa";

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const handleVerify = () => {
    console.log("Verifying code:", code);
    // TODO: Call your API here (e.g., fetch("/auth/verify-code", { ... }))
  };

  const isFormValid = code.length === 6; // 6-digit code only

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #A24FF6 0%, #667eea 50%, #764ba2 100%)",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-orange-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-40 w-12 h-12 bg-teal-300 rounded-full opacity-20 animate-bounce"></div>
      </div>

      {/* Back to Login */}
      <button
        onClick={() => (window.location.href = "/login")}
        className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors z-20"
      >
        <FaArrowLeft />
        <span className="hidden sm:inline">Back to Login</span>
      </button>

      {/* Verify Code Card */}
      <div className="bg-white/15 backdrop-blur-md w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl border border-white/20 relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4 animate-pulse">
            <FaGamepad className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Verify Your Account
          </h1>
          <p className="text-white/80">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-white/90">
            Verification Code
          </label>
          <div className="relative">
            <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl 
                text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
                focus:ring-green-400/50 focus:bg-white transition-all tracking-widest 
                text-center text-lg font-bold"
              placeholder="______"
            />
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isFormValid}
          className={`w-full font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg ${
            isFormValid
              ? "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
              : "bg-gray-400 text-gray-200 cursor-not-allowed hover:scale-100"
          }`}
        >
          Verify Code
        </button>
        {/* Resend Code */}
        <div className="text-center mt-6">
          <p className="text-white/80">
            Didn’t receive the code?{" "}
            <button className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors">
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;