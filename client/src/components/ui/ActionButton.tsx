import React from 'react';

interface ActionButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ElementType;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, children, variant = 'primary', type = 'button', icon: Icon }) => {
  const baseClasses = "px-4 py-2 font-semibold rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
  };
  return (
    <button type={type} onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};