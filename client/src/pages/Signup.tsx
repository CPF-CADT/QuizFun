import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useState } from "react";
import { authApi } from "../service/api";
import { FaRocket, FaStar, FaBook, FaHeart, FaGamepad, FaArrowLeft, FaUser, FaLock } from "react-icons/fa";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const [emailError, setEmailError] = useState<string | null>(null);
const [passwordError, setPasswordError] = useState<string | null>(null);
const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

const handleSignup = async () => {
  // Reset errors before checking
  setEmailError(null);
  setPasswordError(null);
  setConfirmPasswordError(null);

  // Password complexity
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  if (!passwordRegex.test(formData.password)) {
    setPasswordError("Password must include uppercase, lowercase, and a number");
    return;
  }

  // Confirm password
  if (formData.password !== formData.confirmPassword) {
    setConfirmPasswordError("Passwords do not match");
    return;
  }

  try {
    const res = await authApi.signUp({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (res.data?.message) {
      navigate("/verifycode", { state: { email: formData.email } });
    }
  } catch (err: any) {
    console.error("Backend error response:", err.response?.data);

    if (err.response?.data?.error?.toLowerCase().includes("email")) {
      setEmailError("Email is already used");
    } else {
      setEmailError(err.response?.data?.error || "Something went wrong");
    }
  }
};




  const isFormValid =
    formData.name.length > 0 &&
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

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
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 hover:scale-105 z-20 hidden md:flex"
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
        <FaArrowLeft />
        </div>
        <span className="font-medium">Back to Home</span>
      </button>

      {/* Main Sign Up Card - Full screen on mobile, normal on desktop */}
      <div
        className="w-full h-screen md:h-auto md:bg-gradient-to-br md:from-purple-600/90 md:via-purple-500/90 md:to-indigo-800/90 
                bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-800
                backdrop-blur-xl md:max-w-md md:mx-4 p-6 md:p-8 rounded-none md:rounded-3xl shadow-2xl 
                border-0 md:border border-white/20 relative z-10 md:transform md:hover:scale-[1.02] 
                transition-all duration-300 flex flex-col justify-start pt-16 md:justify-center md:pt-0"
      >
        {/* Mobile Back Button - Only visible on mobile */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center justify-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 md:hidden"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
            <FaArrowLeft />
          </div>
        </button>

        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-xl mb-4 mx-auto">
            <img src="/image/logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-full" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            Sign Up
          </h1>
          <p className="text-gray-200 text-base md:text-lg">
            Create an account to join the fun!
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 md:space-y-5">
          {/* Username */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-100 mb-2">Username</label>
            <div className="relative">
              <FaUser className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400 transition-colors text-sm md:text-base" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your username"
                className="w-full pl-10 md:pl-12 pr-12 md:pr-14 py-3 md:py-4 bg-white/95 border-2 border-transparent rounded-2xl 
               text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
               focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 text-base md:text-lg"
              />
            </div>
          </div>

          {/* Email */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-100 mb-2">Email</label>
            <div className="relative">
              <FaUser className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400 transition-colors text-sm md:text-base" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full pl-10 md:pl-12 pr-12 md:pr-14 py-3 md:py-4 bg-white/95 border-2 border-transparent rounded-2xl 
               text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
               focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 text-base md:text-lg"
              />
            </div>
                    {emailError && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-100 border border-red-300 rounded-lg px-3 py-2 animate-fadeIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{emailError}</span>
            </div>
          )}

          </div>

          {/* Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-100 mb-2">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400 transition-colors text-sm md:text-base" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full pl-10 md:pl-12 pr-12 md:pr-14 py-3 md:py-4 bg-white/95 border-2 border-transparent rounded-2xl 
               text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
               focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 text-base md:text-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
              >
                
              </button>
            </div>
             {/* Error */}
{passwordError && (
  <div className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 border border-red-300 px-3 py-2 animate-fadeIn">
    <svg
      className="w-4 h-4 text-red-500 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-sm font-medium text-red-600">{passwordError}</p>
  </div>
)}

          </div>

          {/* Confirm Password */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-100 mb-2">Confirm Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400 transition-colors text-sm md:text-base" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                className="w-full pl-10 md:pl-12 pr-12 md:pr-14 py-3 md:py-4 bg-white/95 border-2 border-transparent rounded-2xl 
               text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 
               focus:ring-purple-400/40 focus:border-purple-400 transition-all duration-300 text-base md:text-lg"
              />
            </div>
 {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
          </div>

          {/* Submit */}
          <button
            onClick={handleSignup}
            disabled={!isFormValid}
            className={`w-full font-bold py-3 md:py-4 rounded-2xl transition-all duration-300 transform shadow-xl text-base md:text-lg ${
              isFormValid
                ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white hover:scale-105 hover:shadow-2xl"
                : "bg-gray-400/50 text-gray-300 cursor-not-allowed"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4 md:my-6">
          <div className="flex-1 border-t border-white/30"></div>
          <span className="text-white/60 text-sm">or</span>
          <div className="flex-1 border-t border-white/30"></div>
        </div>

        {/* Social Login */}
           <GoogleLoginButton />

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-200 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-yellow-300 hover:text-yellow-200 font-semibold underline underline-offset-4 decoration-2 transition-all duration-300"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
);
};

export default Signup;
