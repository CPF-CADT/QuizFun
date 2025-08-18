// src/pages/VerifyCode.tsx
import React, { useState, type ChangeEvent, useEffect } from "react";
import { FaArrowLeft, FaGamepad, FaKey } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../service/api"; // make sure to add verifyCode and resendCode methods

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
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #A24FF6 0%, #667eea 50%, #764ba2 100%)",
      }}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/login")}
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
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Account</h1>
          <p className="text-white/80">
            Enter the 6-digit code sent to {email}
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
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 focus:bg-white transition-all tracking-widest text-center text-lg font-bold"
              placeholder="______"
            />
          </div>
        </div>

        {/* Messages */}
        {error && <p className="text-red-400 mb-4 text-center">{error}</p>}
        {resendMessage && <p className="text-green-400 mb-4 text-center">{resendMessage}</p>}

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isFormValid || loading}
          className={`w-full font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg ${
            isFormValid && !loading
              ? "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
              : "bg-gray-400 text-gray-200 cursor-not-allowed hover:scale-100"
          }`}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        {/* Resend Code */}
        <div className="text-center mt-6">
          <p className="text-white/80">
            Didn’t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors"
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
