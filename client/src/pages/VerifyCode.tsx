import React, { useState, type ChangeEvent, useEffect } from "react";
import { FaKey } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../service/api";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const VerifyCode: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { socialLogin } = useAuth();

    const email = (location.state as { email?: string })?.email || "";

    const [code, setCode] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error("No email provided, redirecting to signup.");
            navigate("/signup");
        }
    }, [email, navigate]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setCode(value);
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length !== 6 || loading) return;

        setLoading(true);
        const toastId = toast.loading('Verifying code...');

        try {
            const response = await authApi.verifyEmail({ email, code });
            
            socialLogin(response.data);
            
            toast.success(response.data.message || "Verification successful!", { id: toastId });
            navigate("/dashboard");
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Verification failed. Please check the code and try again.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendLoading) return;
        
        setResendLoading(true);
        const toastId = toast.loading('Sending a new code...');

        try {
            const response = await authApi.requestCode({ email });
            toast.success(response.data.message || "A new verification code has been sent!", { id: toastId });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Failed to resend code.";
            toast.error(errorMessage, { id: toastId });
        } finally {
            setResendLoading(false);
        }
    };

    const isFormValid = code.length === 6;

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
             style={{ background: "linear-gradient(135deg, #8B5CF6, #A855F7, #C084FC, #9b92c6, #8B5CF6)" }}>
            
            <div className="w-full max-w-md bg-gradient-to-br from-purple-600/90 to-indigo-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 z-10">
                <div className="text-center mb-8">
                    <img src="/image/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain rounded-full bg-white p-1" />
                    <h1 className="text-3xl font-bold text-white">Verify Your Account</h1>
                    <p className="text-gray-200 mt-2">
                        Enter the 6-digit code sent to <br/><strong>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleVerify}>
                    <div className="relative group">
                        <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-yellow-400" />
                        <input
                            type="text"
                            maxLength={6}
                            value={code}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 bg-white/95 border-2 border-transparent rounded-xl text-gray-800 tracking-[0.5em] text-center font-bold text-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
                            placeholder="------"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={`w-full font-bold mt-6 py-3 rounded-xl transition-all duration-300 transform shadow-xl ${isFormValid && !loading ? "bg-gradient-to-r from-yellow-400 to-pink-500 text-white hover:scale-105" : "bg-gray-500/50 text-gray-300 cursor-not-allowed"}`}
                    >
                        {loading ? "Verifying..." : "Verify & Login"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-gray-200 text-sm">
                        Didn’t receive the code?{" "}
                        <button onClick={handleResend} disabled={resendLoading} className="text-yellow-300 hover:text-yellow-200 font-semibold underline disabled:text-gray-400 disabled:cursor-wait">
                            {resendLoading ? "Sending..." : "Resend"}
                        </button>
                    </p>
                </div>
                 <button onClick={() => navigate('/signup')} className="mt-4 w-full text-center text-gray-300 text-sm hover:text-white">
                    Back to Sign Up
                 </button>
            </div>
        </div>
    );
};

export default VerifyCode;

