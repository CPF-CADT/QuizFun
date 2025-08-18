// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { FaUser, FaLock, FaArrowLeft, FaGamepad } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError('');
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to sign in. Please check your credentials.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email.length > 0 && formData.password.length > 0;

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #A24FF6 0%, #667eea 50%, #764ba2 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-orange-300 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors z-20"
      >
        <FaArrowLeft />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      <div className="bg-white/15 backdrop-blur-md w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl border border-white/20 relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <FaGamepad className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
          <p className="text-white/80">Sign in to continue your quiz adventure</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">Email</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text" name="email" value={formData.email} onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:bg-white transition-all"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 focus:bg-white transition-all"
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <AiOutlineEye className="text-xl" /> : <AiOutlineEyeInvisible className="text-xl" />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-300 text-sm text-center bg-red-900/30 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={!isFormValid || isLoading} className={`w-full font-bold py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center justify-center ${isFormValid && !isLoading ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-white/80">
            New to Fun Quiz?{" "}
            <button 
              onClick={() => navigate('/signup')}
              className="text-yellow-300 hover:text-yellow-200 font-semibold"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
