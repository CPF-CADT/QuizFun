// src/components/ActivityFeed.tsx
import React from 'react';
import { Globe } from 'lucide-react';

const ActivityFeed: React.FC = () => {
  const overviewStats = [
    { label: "Quizzes Taken", value: "23", color: "bg-emerald-400" },
    { label: "New Students", value: "5", color: "bg-blue-400" },
    { label: "Avg. Score", value: "84%", color: "bg-purple-400" },
    { label: "Total Points", value: "2,847", color: "bg-amber-400" },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 p-6 shadow-xl hover:shadow-2xl transition-shadow duration-300 ml-5">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        <Globe className="w-5 h-5 mr-2 text-blue-500" />
        Today's Overview
      </h3>
      <div className="space-y-5">
        {overviewStats.map((stat, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-white/60 rounded-xl hover:bg-white/90 transition-colors duration-200"
          >
            <div className="flex items-center">
              <span className="text-gray-700 text-sm font-medium">{stat.label}</span>
            </div>
            <span className={`text-gray-900 font-bold text-sm px-3 py-1 rounded-lg ${stat.color} text-white`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;
