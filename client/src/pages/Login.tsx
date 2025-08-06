import React from "react";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

        <label className="block mb-2 text-sm font-medium">Username or email</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block mb-2 text-sm font-medium">Password</label>
        <div className="relative">
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <AiOutlineEyeInvisible className="absolute right-3 top-3 text-xl text-gray-500 cursor-pointer" />
        </div>

        <div className="mb-4 text-right text-sm">
          <a href="#" className="text-blue-600 hover:underline">
            Reset your password
          </a>
        </div>

        <button
          className="w-full bg-gray-300 text-white font-semibold py-2 px-4 rounded-md cursor-not-allowed mb-4"
          disabled
        >
          Login
        </button>

        <div className="flex items-center justify-center my-4 text-gray-500">
          <span className="px-2">or</span>
        </div>

        <div className="space-y-2">
          <button className="flex items-center justify-center w-full border rounded-md py-2 hover:bg-gray-100 gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          <button className="flex items-center justify-center w-full border rounded-md py-2 hover:bg-gray-100 gap-2">
            <img src="https://www.svgrepo.com/show/303128/apple-logo.svg" alt="Apple" className="w-5 h-5" />
            Continue with Apple
          </button>
          <button className="flex items-center justify-center w-full border rounded-md py-2 hover:bg-gray-100 gap-2">
            <img src="https://www.svgrepo.com/show/452196/facebook-1.svg" alt="Facebook" className="w-5 h-5" />
            Continue with Facebook
          </button>
        </div>

        <div className="text-center text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>

        <div className="text-center text-xs text-gray-500 mt-8">
          By signing up, you accept our{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Terms and Conditions
          </a>
          . <br />
          Please read our{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Privacy Notice
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default Login;
