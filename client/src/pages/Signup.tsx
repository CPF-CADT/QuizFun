import { useState } from "react";

const Signup = () => {
  const [email, setEmail] = useState<string>("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Create an account</h1>
        <h2 className="text-xl font-semibold mb-6">Sign up with your email</h2>

        <div className="mb-4 text-left">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          className={`w-full py-2 rounded-md font-semibold text-white ${
            email.includes("@")
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!email.includes("@")}
        >
          Continue
        </button>

        <div className="flex items-start mt-3 text-sm text-left">
          <input type="checkbox" id="subscribe" className="mr-2 mt-1" />
          <label htmlFor="subscribe">
            I want to receive information, offers, recommendations and updates
            from Fun Quiz and{" "}
            <a href="#" className="text-purple-700 underline">
              other companies within the Fun Quiz Group
            </a>
            .
          </label>
        </div>

        <p className="text-xs text-gray-600 mt-4">
          By signing up, you accept our{" "}
          <a href="#" className="text-purple-700 underline">
            Terms and Conditions
          </a>
          .<br />
          Please read our{" "}
          <a href="#" className="text-purple-700 underline">
            Privacy Notice
          </a>
          .
        </p>

        <div className="my-5 text-sm text-gray-500">or</div>

        <div className="flex flex-col gap-3">
          <button className="border border-gray-300 py-2 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
          <button className="border border-gray-300 py-2 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475699/microsoft.svg" alt="Microsoft" className="w-5 h-5" />
            Continue with Microsoft
          </button>
          <button className="border border-gray-300 py-2 rounded-md hover:bg-gray-100 flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/452196/facebook-1.svg" alt="Facebook" className="w-5 h-5" />
            Continue with Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
