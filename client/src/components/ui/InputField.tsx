import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ElementType;
  name?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ id, label, type, value, onChange, icon: Icon, name }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="w-5 h-5 text-gray-400" />
      </span>
      <input
        type={type}
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
      />
    </div>
  </div>
);