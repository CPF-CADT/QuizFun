import React, { useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { FaUser, FaLock, FaArrowLeft, FaGamepad, FaStar, FaEnvelope } from "react-icons/fa";
import { authApi } from "../service/api"; 
const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSignup = async () => {
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await authApi.signUp({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      // optionally: profile_url or role if you have those fields in your form
    });

    if (res.data?.message) {
      alert(res.data.message); // "Registration successful..."
      window.location.href = "/VerifyCode";
    }
  } catch (err: any) {
    console.error("Backend error response:", err.response?.data);
    alert(err.response?.data?.error || "Something went wrong");
  }
};




  const isFormValid =
    formData.name.length > 0 &&
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #A24FF6 0%, #667eea 50%, #764ba2 100%)'
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

      {/* Floating emojis */}
      <div className="absolute top-16 left-16 text-4xl opacity-60 animate-pulse">🎯</div>
      <div className="absolute top-24 right-24 text-3xl opacity-60 animate-bounce">⚡</div>
      <div className="absolute bottom-32 left-12 text-4xl opacity-60 animate-pulse">🚀</div>
      <div className="absolute bottom-24 right-16 text-3xl opacity-60 animate-bounce">✨</div>

      {/* Back to Home */}
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors z-20"
      >
        <FaArrowLeft />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      {/* Main Signup Card */}
      <div className="bg-white/15 backdrop-blur-md w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl border border-white/20 relative z-10 mt-20 mb-20">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4 animate-pulse">
            <FaGamepad className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-white/80">Join Fun Quiz and start your adventure</p>
        </div>

        {/* Signup Form */}
        <div className="space-y-6">
          {/* Username */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">
              Username
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all"
                placeholder="Enter your username"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">
              Email Address
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <AiOutlineEye className="text-xl" /> : <AiOutlineEyeInvisible className="text-xl" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSignup}
            disabled={!isFormValid}
            className={`w-full font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg ${
              isFormValid
                ? 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed hover:scale-100'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center my-6">
          <div className="border-t border-white/30 flex-1"></div>
          <span className="px-4 text-white/70 text-sm">or sign up with</span>
          <div className="border-t border-white/30 flex-1"></div>
        </div>

        {/* Social Signup */}
        <div className="space-y-3">
          <button className="flex items-center justify-center w-full bg-white/10 border border-white/30 rounded-xl py-3 hover:bg-white/20 text-white gap-3">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          <button className="flex items-center justify-center w-full bg-white/10 border border-white/30 rounded-xl py-3 hover:bg-white/20 text-white gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-6" />
            Continue with Apple
          </button>
          <button className="flex items-center justify-center w-full bg-white/10 border border-white/30 rounded-xl py-3 hover:bg-white/20 text-white gap-3">
            <img src="https://www.svgrepo.com/show/452196/facebook-1.svg" alt="Facebook" className="w-5 h-5" />
            Continue with Facebook
          </button>
        </div>

        {/* Link to Login */}
        <div className="text-center mt-8">
          <p className="text-white/80">
            Already have an account?{" "}
            <button
              onClick={() => window.location.href = '/login'}
              className="text-yellow-300 hover:text-yellow-200 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Terms */}
        <div className="text-center text-xs text-white/60 mt-6 leading-relaxed">
          By signing up, you agree to our{" "}
          <button className="text-blue-300 hover:text-blue-200 underline">
            Terms and Conditions
          </button>{" "}
          and{" "}
          <button className="text-blue-300 hover:text-blue-200 underline">
            Privacy Policy
          </button>.
        </div>
      </div>

      {/* Footer Fun Stats */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-6 text-white/70 text-sm">
        <div className="flex items-center space-x-1">
          <FaStar className="text-yellow-300" />
          <span>50K+ Teachers</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaGamepad className="text-green-300" />
          <span>2M+ Quizzes</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
