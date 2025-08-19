import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useState } from "react";
import { authApi } from "../service/api";
const Icon = ({ path, className = 'w-5 h-5' }: { path: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const ICONS = {
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
  arrowLeft: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  gamepad: 'M16.5 2h-9C6.67 2 6 2.67 6 3.5v11c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-11C18 2.67 17.33 2 16.5 2zM8 12H6v-2h2v2zm0-3H6V7h2v2zm3 3H9v-2h2v2zm0-3H9V7h2v2zm3 3h-2v-2h2v2zm0-3h-2V7h2v2zm3-2h-1V6h1v1zm0 2h-1V8h1v1zM4 18h16v2H4z',
  envelope: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  eyeOpen: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  eyeClosed: 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
};

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      });
      if (res.data?.message) {
        alert(res.data.message);
        navigate("/verifycode", { state: { email: formData.email } });
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
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
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
        <Icon path={ICONS.arrowLeft} />
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      <div className="bg-white/15 backdrop-blur-md w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl border border-white/20 relative z-10 my-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4 animate-pulse">
            <Icon path={ICONS.gamepad} className="text-2xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-white/80">Join Fun Quiz and start your adventure</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon path={ICONS.user} /></span>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all" placeholder="Enter your username" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon path={ICONS.envelope} /></span>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all" placeholder="Enter your email" />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon path={ICONS.lock} /></span>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-12 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Icon path={showPassword ? ICONS.eyeOpen : ICONS.eyeClosed} className="text-xl"/>
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-semibold text-white/90">Confirm Password</label>
            <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon path={ICONS.lock} /></span>
              <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full pl-10 pr-12 py-3 bg-white/90 border border-white/30 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-all" placeholder="Confirm your password" />
            </div>
          </div>
          <button onClick={handleSignup} disabled={!isFormValid} className={`w-full font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg ${isFormValid ? 'bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white' : 'bg-gray-400 text-gray-200 cursor-not-allowed hover:scale-100'}`}>
            Create Account
          </button>
        </div>

        <div className="flex items-center justify-center my-6">
          <div className="border-t border-white/30 flex-1"></div>
          <span className="px-4 text-white/70 text-sm">or sign up with</span>
          <div className="border-t border-white/30 flex-1"></div>
        </div>

        <div className="space-y-3">
          <GoogleLoginButton />

          <button className="flex items-center justify-center w-full bg-white/10 border border-white/30 rounded-xl py-3 hover:bg-white/20 text-white gap-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-6" />
            Continue with Apple
          </button>
          <button className="flex items-center justify-center w-full bg-white/10 border border-white/30 rounded-xl py-3 hover:bg-white/20 text-white gap-3">
            <img src="https://www.svgrepo.com/show/452196/facebook-1.svg" alt="Facebook" className="w-5 h-5" />
            Continue with Facebook
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/80">
            Already have an account?{" "}
            <button onClick={() => navigate('/login')} className="text-yellow-300 hover:text-yellow-200 font-semibold">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
