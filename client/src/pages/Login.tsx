import React, { useState } from "react";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { FaUser, FaLock, FaArrowLeft, FaGamepad, FaStar } from "react-icons/fa";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = () => {
    console.log('Signing in with:', formData);
    // Add your sign-in logic here
  };

  const isFormValid = formData.email.length > 0 && formData.password.length > 0;

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

      {/* Back to Home Button */}
      <button 
        onClick={() => window.location.href = '/'}
        className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors z-20"
      >
        <FaArrowLeft />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      {/* Main Login Card */}
      <div className="bg-white/15 backdrop-blur-md w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl border border-white/20 relative z-10">
        
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 animate-pulse">
            <FaGamepad className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-white/80">Sign in to continue your quiz adventure</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Email/Username Input */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">
              Username or Email
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:bg-white transition-all"
                placeholder="Enter your email or username"
              />
            </div>
          </div>

          {/* Password Input */}
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
                className="w-full pl-10 pr-12 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:bg-white transition-all"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <AiOutlineEye className="text-xl" /> : <AiOutlineEyeInvisible className="text-xl" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button className="text-yellow-300 hover:text-yellow-200 text-sm font-medium transition-colors">
              Forgot your password?
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleSignIn}
            disabled={!isFormValid}
            className={`w-full font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg ${
              isFormValid
                ? 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed hover:scale-100'
            }`}
          >
            {isFormValid ? ' Sign In' : 'Sign In'}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center my-6">
          <div className="border-t border-white/30 flex-1"></div>
          <span className="px-4 text-white/70 text-sm">or continue with</span>
          <div className="border-t border-white/30 flex-1"></div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button className="flex items-center justify-center w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl py-3 hover:bg-white/20 transition-all text-white gap-3">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          <button className="flex items-center justify-center w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl py-3 hover:bg-white/20 transition-all text-white gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-6" />
            Continue with Apple
          </button>
          <button className="flex items-center justify-center w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl py-3 hover:bg-white/20 transition-all text-white gap-3">
            <img src="https://www.svgrepo.com/show/452196/facebook-1.svg" alt="Facebook" className="w-5 h-5" />
            Continue with Facebook
          </button>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-white/80">
            New to Fun Quiz?{" "}
            <button 
              onClick={() => window.location.href = '/signup'}
              className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors"
            >
              Create Account
            </button>
          </p>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center text-xs text-white/60 mt-6 leading-relaxed">
          By signing in, you accept our{" "}
          <button className="text-blue-300 hover:text-blue-200 underline transition-colors">
            Terms and Conditions
          </button>
          {" "}and{" "}
          <button className="text-blue-300 hover:text-blue-200 underline transition-colors">
            Privacy Policy
          </button>
          .
        </div>
      </div>

      {/* Fun Stats Footer */}
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

export default Login;