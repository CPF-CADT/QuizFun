import React from 'react';

const Joingame: React.FC = () => {
  return (
    <div className="min-h-screen bg-purple-600 flex flex-col justify-between text-white">
      {/* Top Section */}
      <div className="flex flex-col items-center justify-center flex-1 px-4 text-center">
        {/* Logo top right */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6" />
            <span className="font-semibold text-black">Fun Quiz</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold mb-6">Enter Pin Number</h1>
        <input
          type="text"
          placeholder="Enter pin here"
          className="w-64 px-4 py-2 rounded-md text-black text-center outline-none focus:ring-4 focus:ring-white"
        />

        <p className="text-sm mt-4 text-black">
          By signing up, you accept our{' '}
          <a href="#" className="text-blue-200 underline">
            Terms and Conditions
          </a>
          .<br />
          Please read our{' '}
          <a href="#" className="text-blue-200 underline">
            Privacy Notice
          </a>
          .
        </p>
      </div>

      {/* Footer Section */}
      <footer className="bg-white text-black py-8 px-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
        <div className="flex flex-col items-center sm:items-start">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 mb-2" />
          <span className="text-xl font-bold">Fun Quiz</span>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Start Quiz</a></li>
            <li><a href="#" className="hover:underline">Categories</a></li>
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Contact Info</h3>
          <ul className="space-y-1">
            <li>📧 Email: support@funquiz.com</li>
            <li>📞 Phone (optional): +855 XXX XXX XXX</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default Joingame;
