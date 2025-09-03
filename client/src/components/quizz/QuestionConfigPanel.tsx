import React from 'react';
import { Award, Clock, ListChecks } from 'lucide-react';

export type QuestionType = 'Multiple Choice' | 'True/False';

interface QuestionConfigPanelProps {
  questionType: QuestionType;
  onQuestionTypeChange: (type: QuestionType) => void;
  points: number;
  onPointsChange: (points: number) => void;
  timeLimit: number;
  onTimeLimitChange: (time: number) => void;
}

export const QuestionConfigPanel: React.FC<QuestionConfigPanelProps> = ({
  questionType, onQuestionTypeChange,
  points, onPointsChange,
  timeLimit, onTimeLimitChange
}) => {
  return (
    <div className="p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 lg:sticky lg:top-8">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Question Settings</h3>
      <div className="space-y-6">
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-600 mb-2">
            <ListChecks className="w-4 h-4 mr-2" />
            Answer Type
          </label>
          <select
            value={questionType}
            onChange={(e) => onQuestionTypeChange(e.target.value as QuestionType)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option>Multiple Choice</option>
            <option>True/False</option>
          </select>
        </div>
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-600 mb-2">
            <Award className="w-4 h-4 mr-2" />
            Points
          </label>
          <input
            type="number"
            min="0"
            value={points}
            onChange={(e) => onPointsChange(Number(e.target.value))}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="flex items-center text-sm font-semibold text-gray-600 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            Time Limit (seconds)
          </label>
          <input
            type="number"
            min="5"
            step="5"
            value={timeLimit}
            onChange={(e) => onTimeLimitChange(Number(e.target.value))}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};