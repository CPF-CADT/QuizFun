import React from 'react';
import { FaRocket } from 'react-icons/fa';

const CTASection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Ready to Make Learning <span className="text-yellow-300">Unforgettable?</span>
        </h2>
        <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
          Join thousands of educators who've already transformed their classrooms. Your students will thank you!
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-900 font-bold px-10 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-110 shadow-2xl">
            <FaRocket className="inline mr-2" />
            Start Free Trial
          </button>
          <button className="border-2 border-white text-white font-bold px-10 py-4 rounded-xl hover:bg-white hover:text-purple-600 transition-all transform hover:scale-110">
            Watch Demo
          </button>
        </div>
        <p className="text-sm text-purple-200 mt-4">No credit card required </p>
      </div>
    </div>
  );
};

export default CTASection;