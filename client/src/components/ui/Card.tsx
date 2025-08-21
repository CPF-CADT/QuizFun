import React from 'react';

interface CardProps {
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  extraHeaderContent?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, icon: Icon, children, extraHeaderContent }) => (
  <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6 transition-all duration-300 hover:shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        {Icon && <Icon className="w-6 h-6 mr-3 text-indigo-600" />}
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div>{extraHeaderContent}</div>
    </div>
    <div>{children}</div>
  </div>
);