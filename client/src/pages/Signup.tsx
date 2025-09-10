import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useState } from "react";
import { authApi } from "../service/api";
import { FaRocket, FaStar, FaBook, FaHeart, FaGamepad, FaArrowLeft, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    
    // State for loading status to prevent double-clicks
    const [isLoading, setIsLoading] = useState(false);

    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async () => {
        // Reset errors
        setEmailError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);

        // Basic frontend validation
        if (formData.password !== formData.confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(formData.password)) {
            setPasswordError("Password must be 6+ chars with uppercase, lowercase, and a number.");
            return;
        }

        setIsLoading(true); // Disable button
        try {
            const res = await authApi.signUp({
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            if (res.data?.message) {
                // On success, navigate to the verification page
                navigate("/verify", { state: { email: formData.email } });
            }
        } catch (err: any) {
            console.error("Backend error response:", err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.message || "An unexpected error occurred.";
            
            if (errorMessage.toLowerCase().includes("email")) {
                setEmailError(errorMessage);
            } else {
                // Display other errors generically or specifically if needed
                setEmailError(errorMessage);
            }
        } finally {
            setIsLoading(false); // Re-enable button
        }
    };

    const isFormValid =
        formData.name.length > 0 &&
        formData.email.includes("@") &&
        formData.password.length > 0 &&
        formData.password === formData.confirmPassword;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden md:px-4 md:py-8"
             style={{ background: "linear-gradient(135deg, #8B5CF6, #A855F7, #C084FC, #9b92c6, #8B5CF6)" }}>
            
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
                <div className="absolute top-20 left-10 transform animate-bounce"><div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-4 shadow-lg"><FaRocket className="text-2xl text-white" /></div></div>
                <div className="absolute top-32 right-20 transform animate-pulse"><div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg"><FaStar className="text-xl text-white" /></div></div>
                <div className="absolute top-1/2 left-16 transform -translate-y-1/2 animate-bounce" style={{ animationDelay: "1s" }}><div className="bg-gradient-to-r from-pink-400 to-red-500 rounded-full p-3 shadow-lg"><FaBook className="text-lg text-white" /></div></div>
                <div className="absolute bottom-40 right-16 transform animate-pulse" style={{ animationDelay: "0.5s" }}><div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-3 shadow-lg"><FaHeart className="text-lg text-white" /></div></div>
                <div className="absolute bottom-20 left-20 transform animate-bounce" style={{ animationDelay: "1.5s" }}><div className="bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full p-3 shadow-lg"><FaGamepad className="text-lg text-white" /></div></div>
            </div>

            <button onClick={() => navigate("/")} className="absolute top-6 left-6 items-center space-x-2 text-white hover:text-yellow-300 transition-all duration-300 hover:scale-105 z-20 hidden md:flex">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2"><FaArrowLeft /></div>
                <span className="font-medium">Back to Home</span>
            </button>

            <div className="w-full h-screen md:h-auto md:bg-gradient-to-br md:from-purple-600/90 md:to-indigo-800/90 bg-gradient-to-br from-purple-600 to-indigo-800 backdrop-blur-xl md:max-w-md p-6 md:p-8 md:rounded-3xl shadow-2xl md:border border-white/20 z-10 flex flex-col justify-start pt-16 md:justify-center md:pt-0">
                <button onClick={() => navigate("/")} className="absolute top-6 left-6 flex items-center justify-center text-white hover:text-yellow-300 md:hidden">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2"><FaArrowLeft /></div>
                </button>

                <div className="text-center mb-6 md:mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-xl mb-4">
                        <img src="/image/logo.png" alt="Logo" className="w-16 h-16 object-contain rounded-full" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Sign Up</h1>
                    <p className="text-gray-200">Create an account to join the fun!</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-4">
                    {/* Username */}
                    <div>
                        <div className="relative group">
                             <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400" />
                             <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your username" required className="w-full pl-12 pr-4 py-3 bg-white/95 border-2 border-transparent rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                        </div>
                    </div>
                    {/* Email */}
                    <div>
                        <div className="relative group">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400" />
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" required className="w-full pl-12 pr-4 py-3 bg-white/95 border-2 border-transparent rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                        </div>
                        {emailError && <div className="mt-2 text-red-400 text-sm">{emailError}</div>}
                    </div>
                     {/* Password */}
                    <div>
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400" />
                            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" required className="w-full pl-12 pr-12 py-3 bg-white/95 border-2 border-transparent rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400">
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                         {passwordError && <div className="mt-2 text-red-400 text-sm">{passwordError}</div>}
                    </div>
                     {/* Confirm Password */}
                    <div>
                        <div className="relative group">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-400" />
                            <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" required className="w-full pl-12 pr-4 py-3 bg-white/95 border-2 border-transparent rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                        </div>
                        {confirmPasswordError && <div className="mt-2 text-red-400 text-sm">{confirmPasswordError}</div>}
                    </div>

                    <button type="submit" disabled={!isFormValid || isLoading} className={`w-full font-bold py-3 rounded-xl transition-all duration-300 transform shadow-xl ${isFormValid && !isLoading ? "bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:scale-105" : "bg-gray-500/50 text-gray-300 cursor-not-allowed"}`}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-4"><div className="flex-1 border-t border-white/30"></div><span className="text-white/60 text-sm">or</span><div className="flex-1 border-t border-white/30"></div></div>
                <GoogleLoginButton />
                <div className="text-center mt-6">
                    <p className="text-gray-200 text-sm">Already have an account?{" "}
                        <button onClick={() => navigate("/login")} className="text-yellow-300 hover:text-yellow-200 font-semibold underline">Sign In</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;